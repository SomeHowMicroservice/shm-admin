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

export interface Variants {
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
