export interface GetAllProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  is_active?: boolean;
  search?: string;
  category_id?: string;
  tag_id?: string;
}

export interface GetAllPostsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  is_published?: boolean;
  search?: string;
  topic_id?: string;
}
