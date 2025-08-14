import { File } from "buffer";

type CreatedBy = {
  id: string;
  username?: string;
  profile: Profile;
};

type CreatedAt = {
  id: string;
  username?: string;
  profile: Profile;
};

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
};

export interface ICreateCategoryData {
  name: string;
  slug?: string;
}

export interface Size {
  id: string;
  name: string;
  updated_at: string | number | Date;
  created_at: string | number | Date;
  updated_by: CreatedAt;
  created_by: CreatedBy;
}

export interface Color {
  id: string;
  name: string;
  updated_at: string | number | Date;
  created_at: string | number | Date;
  updated_by: CreatedAt;
  created_by: CreatedBy;
}

export interface Images {
  id: string;
  product_id: string;
  color_id: string;
  is_thumbnail: string;
  sort_order?: string;
  file: File;
}

export interface Tags {
  id: string;
  name: string;
  updated_at: string | number | Date;
  created_at: string | number | Date;
  updated_by: CreatedAt;
  created_by: CreatedBy;
}

export interface Product {
  images: never[];
  variants: never[];
  tags: never[];
  description: string;
  end_sale: undefined;
  end_sale: any;
  start_sale: any;
  start_sale: undefined;
  is_active: any;
  is_sale: any;
  sale_price: any;
  sale_price: undefined;
  updated_by: any;
  updated_at: string | number | Date;
  created_at: string | number | Date;
  created_by: any;
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  variant: {
    size: string;
    color: string;
    tag: string;
  };
}

export interface Category {
  id: string;
  name: string;
}

export interface Inventory {
  sold_quantity: number;
  quantity: number;
  id: string;
  stock: number;
  is_stock: boolean;
}

export interface Variants {
  id?: string;
  sku: string;
  color: Color;
  size: Size;
  inventory: Inventory;
}

export interface Thumbnail {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  categories: Category[];
  thumbnail: Thumbnail;
}
