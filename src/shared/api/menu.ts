import { supabase } from './supabase';
import type { Category, MenuItem } from '../../types';

/**
 * لایه دسترسی به منو.
 *
 * تمام تماس‌های Supabase مربوط به منو فقط در همین فایل است تا اگر روزی
 * بک‌اند عوض شد، فقط این فایل تغییر کند.
 */

interface DbCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface DbMenuItem {
  id: string;
  code: string;
  name: string;
  category_id: string;
  price: number;
  ingredients: string;
  story: string;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  show_in_qr: boolean;
}

export interface Catalog {
  categories: Category[];
  products: MenuItem[];
}

const CATEGORY_FIELDS = 'id,slug,name,icon,sort_order,is_active';
const ITEM_FIELDS =
  'id,code,name,category_id,price,ingredients,story,image_url,is_available,is_featured,show_in_qr';

function mapCatalog(categories: DbCategory[], items: DbMenuItem[]): Catalog {
  const slugById = new Map(categories.map((category) => [category.id, category.slug]));
  const itemCount = new Map<string, number>();

  for (const item of items) {
    const slug = slugById.get(item.category_id);
    if (slug) itemCount.set(slug, (itemCount.get(slug) ?? 0) + 1);
  }

  return {
    categories: categories.map((category) => ({
      id: category.slug,
      name: category.name,
      icon: category.icon,
      order: category.sort_order,
      isActive: category.is_active,
      itemCount: itemCount.get(category.slug) ?? 0,
    })),
    products: items.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      category: slugById.get(item.category_id) ?? '',
      price: item.price,
      ingredients: item.ingredients,
      story: item.story,
      image: item.image_url ?? '',
      isAvailable: item.is_available,
      isFeatured: item.is_featured,
      showInQR: item.show_in_qr,
    })),
  };
}

/** خواندن دسته‌ها و اقلام منو. برای مهمان فقط اقلام قابل‌نمایش برمی‌گردد. */
export async function fetchCatalog(): Promise<Catalog> {
  const [categoryResult, itemResult] = await Promise.all([
    supabase.from('categories').select(CATEGORY_FIELDS).order('sort_order'),
    supabase.from('menu_items').select(ITEM_FIELDS).order('created_at'),
  ]);

  if (categoryResult.error) throw categoryResult.error;
  if (itemResult.error) throw itemResult.error;

  return mapCatalog(categoryResult.data ?? [], itemResult.data ?? []);
}

async function categoryIdBySlug(slug: string): Promise<string> {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`دسته‌بندی «${slug}» پیدا نشد.`);
  return data.id;
}

function itemRow(item: MenuItem, categoryId: string) {
  return {
    code: item.code,
    name: item.name,
    category_id: categoryId,
    price: item.price,
    ingredients: item.ingredients,
    story: item.story,
    image_url: item.image || null,
    is_available: item.isAvailable,
    is_featured: item.isFeatured,
    show_in_qr: item.showInQR,
  };
}

export async function insertCategory(category: Category): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    slug: category.id,
    name: category.name,
    icon: category.icon,
    sort_order: category.order,
    is_active: category.isActive,
  });

  if (error) throw error;
}

export async function setCategoryActive(slug: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('slug', slug);

  if (error) throw error;
}

export async function createMenuItem(item: MenuItem): Promise<void> {
  const categoryId = await categoryIdBySlug(item.category);
  const { error } = await supabase.from('menu_items').insert(itemRow(item, categoryId));

  if (error) throw error;
}

export async function updateMenuItem(item: MenuItem): Promise<void> {
  const categoryId = await categoryIdBySlug(item.category);
  const { error } = await supabase
    .from('menu_items')
    .update(itemRow(item, categoryId))
    .eq('id', item.id);

  if (error) throw error;
}

export async function setMenuItemAvailability(
  id: string,
  isAvailable: boolean
): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);

  if (error) throw error;
}
