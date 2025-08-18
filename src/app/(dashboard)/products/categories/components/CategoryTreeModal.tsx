/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { Button } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const Tree = dynamic(() => import("react-d3-tree").then((m) => m.Tree), {
  ssr: false,
});

export interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategoryMindmapModalProps {
  open: boolean;
  onClose: () => void;
  initialData: Category[];
  title?: string;
}

interface RD3Node {
  name: string;
  attributes?: Record<string, string>;
  children?: RD3Node[];
}

const catToRD3 = (cat: Category): RD3Node & { id: string } => ({
  id: cat.id,
  name: cat.name,
  attributes: { slug: cat.slug },
  children: cat.children?.map(catToRD3),
});

const buildRD3Data = (categories: Category[], title = "Danh mục") => ({
  name: title,
  children: categories.map(catToRD3),
});

const ModalShell: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title = "Danh mục sản phẩm", children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-blue-600/50 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[1200px] h-[85vh] rounded-2xl bg-white shadow-2xl border border-blue-200/50 overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.01]">
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <Button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-200"
          >
            Đóng
          </Button>
        </header>
        <div className="w-full h-[calc(85vh-72px)] bg-blue-50/50">
          {children}
        </div>
      </div>
    </div>
  );
};

const Node: React.FC<{ nodeDatum: any; toggleNode: () => void }> = ({
  nodeDatum,
  toggleNode,
}) => {
  const router = useRouter();

  return (
    <g>
      <rect
        rx={16}
        ry={16}
        width={160}
        height={64}
        x={-80}
        y={-32}
        strokeWidth={1.5}
        stroke="#3B82F6"
        fill="#EFF6FF"
        className="shadow-sm transition-all duration-200 hover:fill-blue-100"
      />

      <g
        onClick={() => router.push(`/products/categories/${nodeDatum.id}`)}
        cursor="pointer"
      >
        <text
          textAnchor="middle"
          fontSize={16}
          fontWeight={400}
          fill="#1E3A8A"
          dy={-2}
        >
          {nodeDatum.name}
        </text>
        {nodeDatum?.attributes?.slug && (
          <text
            textAnchor="middle"
            fontSize={13}
            fill="#64748B"
            dy={16}
            opacity={0.8}
            fontWeight={100}
          >
            {nodeDatum.attributes.slug}
          </text>
        )}
      </g>

      {nodeDatum.children && (
        <foreignObject
          x={58}
          y={8}
          width={24}
          height={24}
          className="cursor-pointer"
          onClick={toggleNode}
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white">
            {nodeDatum.__rd3t.collapsed ? (
              <PlusOutlined style={{ fontSize: 12 }} />
            ) : (
              <MinusOutlined style={{ fontSize: 12 }} />
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const CategoryMindmapModal: React.FC<CategoryMindmapModalProps> = ({
  open,
  onClose,
  initialData,
  title = "Danh mục",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const data = useMemo(
    () => buildRD3Data(initialData, title),
    [initialData, title]
  );

  const recenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width } = el.getBoundingClientRect();
    setTranslate({ x: width / 2, y: 100 });
  }, []);

  useEffect(() => {
    recenter();
    const onResize = () => recenter();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recenter]);

  return (
    <ModalShell open={open} onClose={onClose} title={title}>
      <div ref={containerRef} className="w-full h-full relative font-normal">
        <Tree
          data={data as any}
          translate={translate}
          orientation="vertical"
          zoomable
          collapsible
          separation={{ siblings: 1.3, nonSiblings: 1.5 }}
          pathFunc="elbow"
          pathClassFunc={() =>
            "stroke-blue-400 stroke-2 transition-all duration-300"
          }
          renderCustomNodeElement={(rd3tProps) => <Node {...rd3tProps} />}
          enableLegacyTransitions
          transitionDuration={400}
          zoom={0.8}
          initialDepth={2}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            type="primary"
            onClick={recenter}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            Căn giữa
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

export default CategoryMindmapModal;
