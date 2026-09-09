"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { toSlug, parsePriceCents } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  ensureProductImagesBucket,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/admin";
import { ProductCategory, Size } from "@/generated/prisma";

export type FormState = { error?: string } | undefined;

const CATEGORIES = Object.values(ProductCategory);
const SIZES = Object.values(Size);

async function uploadImages(files: File[]) {
  const realFiles = files.filter((f) => f.size > 0);
  if (realFiles.length === 0) return [];

  const supabase = await ensureProductImagesBucket();
  const uploaded: string[] = [];

  for (const file of realFiles) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Image upload failed: ${error.message}`);

    const { data } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }

  return uploaded;
}

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = toSlug(name) || "product";
  let slug = base;
  let n = 1;
  while (
    await prisma.product.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const colorway = String(formData.get("colorway") ?? "").trim();
  const colorwaySwatch = String(formData.get("colorwaySwatch") ?? "").trim();
  const priceCents = parsePriceCents(formData.get("price"));
  const compareAtRaw = String(formData.get("compareAt") ?? "").trim();
  const compareAtCents = compareAtRaw ? parsePriceCents(compareAtRaw) : null;
  const active = formData.get("active") === "on";
  const variants = SIZES.map((size) => ({
    size,
    stock: Math.max(0, Math.floor(Number(formData.get(`stock_${size}`)) || 0)),
  }));

  if (!name) return { error: "Name is required." } as const;
  if (!description) return { error: "Description is required." } as const;
  if (!CATEGORIES.includes(category as ProductCategory))
    return { error: "Pick a category." } as const;
  if (priceCents === null) return { error: "Enter a valid price." } as const;
  if (compareAtRaw && (compareAtCents === null || compareAtCents <= priceCents))
    return { error: "Compare-at price must be greater than the price." } as const;

  return {
    name,
    description,
    category: category as ProductCategory,
    colorway: colorway || null,
    colorwaySwatch: colorwaySwatch || "#e8ded1",
    priceCents,
    compareAtCents,
    active,
    variants,
  } as const;
}

export async function createProduct(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const fields = readProductFields(formData);
  if ("error" in fields) return fields;

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);

  let imageUrls: string[];
  try {
    imageUrls = await uploadImages(files);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(fields.name);
  const { variants, ...productFields } = fields;

  const product = await prisma.product.create({
    data: {
      ...productFields,
      slug,
      images: {
        create: imageUrls.map((url, position) => ({ url, position })),
      },
      variants: { create: variants },
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(
  productId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const fields = readProductFields(formData);
  if ("error" in fields) return fields;

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File);

  let imageUrls: string[];
  try {
    imageUrls = await uploadImages(files);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const slug = await uniqueSlug(fields.name, productId);
  const { variants, ...productFields } = fields;
  const existingCount = await prisma.productImage.count({
    where: { productId },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...productFields,
      slug,
      images: {
        create: imageUrls.map((url, i) => ({
          url,
          position: existingCount + i,
        })),
      },
      variants: { deleteMany: {}, create: variants },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return undefined;
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductImage(imageId: string, productId: string) {
  await requireAdmin();
  await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${productId}/edit`);
}
