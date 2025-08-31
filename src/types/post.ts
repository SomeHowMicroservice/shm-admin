import { CreatedBy, UpdatedBy } from "./product";

export interface Topic {
  id: string;
  updated_by: UpdatedBy;
  updated_at: string | number | Date | null | undefined;
  created_by: CreatedBy;
  created_at: string | number | Date | null | undefined;
  name: string;
  slug?: string;
  is_deleted?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  topic_id: string;
  topic?: Topic;
  updated_at: string | number | Date;
  created_at: string | number | Date;
  updated_by: UpdatedBy;
  created_by: CreatedBy;
}

export interface ICreateTopicData {
  name: string;
  slug?: string;
}

export interface ICreatePostImageData {
  url: string;
  description?: string;
}

export interface ICreatePostData {
  title: string;
  content: string;
  is_published: boolean;
  topic_id: string;
}
