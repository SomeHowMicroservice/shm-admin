"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Upload, Image, UploadFile, Tooltip, Button, message } from "antd";
import { PlusOutlined, StarOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getBase64 } from "@/utils/image";

type CustomUploadFile = UploadFile & {
  isThumbnail?: boolean;
  isOld?: boolean;
  sortOrder?: number;
};

const uploadButton = (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fafafa",
      transition: "all 0.3s",
      cursor: "pointer",
    }}
    className="hover:shadow-md hover:border-blue-500 hover:text-blue-500"
  >
    <PlusOutlined style={{ fontSize: 20 }} />
    <div style={{ marginTop: 6, fontSize: 12 }}>Upload</div>
  </div>
);

const SortableItem = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    width: 96,
    height: 96,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const ColorImageUpload = ({
  colorName,
  initialList,
  handleColorImageChange,
  onSetThumbnail,
}: {
  colorName: string;
  initialList: CustomUploadFile[];
  handleColorImageChange: (
    color: string,
    info: { fileList: CustomUploadFile[] }
  ) => void;
  onSetThumbnail: (colorName: string, uid: string) => void;
}) => {
  // sync với prop initialList khi parent thay đổi
  const sortByOrder = (list: CustomUploadFile[] = []) =>
    [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const [fileList, setFileList] = useState<CustomUploadFile[]>(
    sortByOrder(initialList || [])
  );

  useEffect(() => {
    setFileList(sortByOrder(initialList || []));
  }, [initialList]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleUploadChange = async ({
    file,
    fileList: newFiles,
  }: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    if (file.status === "removed") return;

    const updatedList = await Promise.all(
      newFiles.map(async (file) => {
        const thumb =
          file.thumbUrl ||
          (file.originFileObj instanceof Blob
            ? await getBase64(file.originFileObj)
            : file.url);
        return {
          ...file,
          uid: file.uid || uuidv4(),
          thumbUrl: thumb,
        } as CustomUploadFile;
      })
    );

    const unique = updatedList.filter(
      (f) => !fileList.some((e) => e.uid === f.uid)
    );
    const merged = [...fileList, ...unique].map((f, i) => ({
      ...(f as CustomUploadFile),
      sortOrder: i + 1,
    }));

    setFileList(merged);
    handleColorImageChange(colorName, { fileList: merged });
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj instanceof Blob) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleRemove = (file: UploadFile) => {
    const newList = fileList
      .filter((f) => f.uid !== file.uid)
      .map((f, i) => ({ ...(f as CustomUploadFile), sortOrder: i + 1 }));
    setFileList(newList);
    handleColorImageChange(colorName, { fileList: newList });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = fileList.findIndex((f) => f.uid === active.id);
      const newIndex = fileList.findIndex((f) => f.uid === over.id);
      const newList = arrayMove(fileList, oldIndex, newIndex).map((f, i) => ({
        ...(f as CustomUploadFile),
        sortOrder: i + 1,
      }));
      setFileList(newList);
      handleColorImageChange(colorName, { fileList: newList });
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="mb-3 font-medium text-gray-700">
        Ảnh cho màu: {colorName} ({fileList.length} ảnh)
        {fileList.find((f) => f.isThumbnail) && (
          <span className="ml-2 text-sm text-blue-500">
            (Thumbnail: {fileList.find((f) => f.isThumbnail)?.name})
          </span>
        )}
      </h4>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fileList.map((f) => String(f.uid))}
          strategy={horizontalListSortingStrategy}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUploadChange}
            onPreview={handlePreview}
            onRemove={handleRemove}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: false,
            }}
            iconRender={(file) =>
              (file as CustomUploadFile).isThumbnail ? (
                <Tooltip title="Thumbnail" className="absolute">
                  <StarOutlined style={{ color: "#1677ff" }} />
                </Tooltip>
              ) : null
            }
            itemRender={(originNode, file) => (
              <SortableItem key={String(file.uid)} id={String(file.uid)}>
                <div style={{ position: "relative", width: 96, height: 96 }}>
                  {originNode}
                  <Button
                    icon={<StarOutlined />}
                    size="small"
                    shape="circle"
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      zIndex: 999,
                      backgroundColor: (file as CustomUploadFile).isThumbnail
                        ? "#1677ff"
                        : "white",
                      color: (file as CustomUploadFile).isThumbnail
                        ? "white"
                        : "#aaa",
                      border: "none",
                      boxShadow: "0 0 2px rgba(0,0,0,0.2)",
                    }}
                    onClick={() => onSetThumbnail(colorName, String(file.uid))}
                  />
                </div>
              </SortableItem>
            )}
          >
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </SortableContext>
      </DndContext>

      <Image
        wrapperStyle={{ display: "none" }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (v) => setPreviewOpen(v),
          afterOpenChange: (v) => !v && setPreviewImage(""),
        }}
        src={previewImage || undefined}
        alt=""
      />
    </div>
  );
};

export default ColorImageUpload;
