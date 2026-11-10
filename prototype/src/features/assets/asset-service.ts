import { createId } from '@/lib/id';
import type { AssetItem } from '@/lib/types';

const MAX_ASSET_BYTES = 2 * 1024 * 1024;

export async function createAssetFromFile(file: File): Promise<AssetItem> {
  if (file.size > MAX_ASSET_BYTES) {
    throw new Error('单个本地资源当前限制为 2MB。');
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
  const kind: AssetItem['kind'] = file.type.startsWith('video/')
    ? 'video'
    : file.type.startsWith('audio/')
      ? 'audio'
      : file.type.includes('model') || /\.(glb|gltf|obj|fbx)$/i.test(file.name)
        ? '3d'
        : 'image';
  return {
    id: createId('asset'),
    name: file.name,
    kind,
    mimeType: file.type || 'application/octet-stream',
    dataUrl,
    size: file.size,
    createdAt: Date.now(),
  };
}

