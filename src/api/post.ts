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

const postApi = {
  createTopic,
  getAllTopics,
  updateTopic,
  deleteTopic,
  deleteTopics,
  restoreTopic,
  restoreTopics,
  deleteTopicPermanent,
  deleteTopicsPermanent,
  createPost,
  getDeletedTopics,
};

export default postApi;
