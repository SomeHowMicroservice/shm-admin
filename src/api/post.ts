import axiosRequest from "@/config/axios";
import { ICreateTopicData, ICreatePostData } from "@/types/post";

export const createTopic = (data: ICreateTopicData) => {
  return axiosRequest.post("/admin/topics", data);
};

export const getAllTopics = () => {
  return axiosRequest.get("/admin/topics");
};

export const updateTopic = (id: string, data: ICreateTopicData) => {
  return axiosRequest.put(`/admin/topics/${id}`, data);
};

export const getDeletedTopics = () => {
  return axiosRequest.get("/admin/topics/deleted");
};

export const deleteTopic = (id: string) => {
  return axiosRequest.delete(`/admin/topics/${id}`);
};

export const deleteTopics = (ids: string[]) => {
  return axiosRequest.delete(`/admin/topics`, { data: { ids } });
};

export const restoreTopic = (id: string) => {
  return axiosRequest.put(`/admin/topics/${id}/restore`);
};

export const restoreTopics = (ids: string[]) => {
  return axiosRequest.put(`/admin/topics/restore`, { ids });
};

export const deleteTopicPermanent = (id: string) => {
  return axiosRequest.delete(`/admin/topics/${id}/permanent`);
};

export const deleteTopicsPermanent = (ids: string[]) => {
  return axiosRequest.delete(`/admin/topics/permanent`, { data: { ids } });
};

export const createPost = (data: ICreatePostData) => {
  return axiosRequest.post("/admin/posts", data);
};

export const getAllPosts = () => {
  return axiosRequest.get("/admin/posts");
};

export const getPostById = (id: string) => {
  return axiosRequest.get(`/admin/posts/${id}`);
};

export const getDeletedPosts = () => {
  return axiosRequest.get("/admin/posts/deleted");
};

export const deletePost = (id: string) => {
  return axiosRequest.delete(`/admin/posts/${id}`);
};

export const deletePosts = (ids: string[]) => {
  return axiosRequest.delete(`/admin/posts`, { data: { ids } });
};

export const restorePost = (id: string) => {
  return axiosRequest.put(`/admin/posts/${id}/restore`);
};

export const restorePosts = (ids: string[]) => {
  return axiosRequest.put(`/admin/posts/restore`, { ids });
};

export const deletePostPermanent = (id: string) => {
  return axiosRequest.delete(`/admin/posts/${id}/permanent`);
};

export const deletePostsPermanent = (ids: string[]) => {
  return axiosRequest.delete(`/admin/posts/permanent`, { data: { ids } });
};

export const updatePost = (id: string, data: ICreatePostData) => {
  return axiosRequest.put(`/admin/posts/${id}`, data);
};

export const getAllTopicsNoAdmin = () => {
  return axiosRequest.get("/topics");
};
