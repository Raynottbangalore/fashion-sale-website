import React, { useState, useEffect } from "react";
import { storage } from "../firebase";
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import { ImageIcon, UploadCloud, Trash2, Loader2, Plus, X } from "lucide-react";

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchImages = async () => {
    try {
      setLoading(true);
      const storageRef = ref(storage, "gallery");
      const result = await listAll(storageRef);
      const urlPromises = result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { name: item.name, url, fullPath: item.fullPath };
      });
      const urls = await Promise.all(urlPromises);
      setImages(urls);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      setError("Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
      });
      await Promise.all(uploadPromises);
      fetchImages();
    } catch (err) {
      console.error("Error uploading images:", err);
      setError("Failed to upload some images.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fullPath) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
      setImages(images.filter((img) => img.fullPath !== fullPath));
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("Failed to delete image.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-stone-800">Media Library</h2>
          <p className="text-sm text-stone-500">Manage all your website assets in one place.</p>
        </div>
        <label className="flex items-center space-x-2 bg-[#6B2D2D] text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-stone-900 transition-all shadow-lg">
          {uploading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Plus size={20} />
          )}
          <span>Add New Media</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-center">
          <X className="mr-3 h-5 w-5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-[#6B2D2D]" />
          <p className="text-stone-400 font-medium">Loading assets...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
          <ImageIcon className="mx-auto h-12 w-12 text-stone-300 mb-4" />
          <h3 className="text-xl font-playfair font-bold text-stone-800 mb-2">No Images Found</h3>
          <p className="text-stone-500">Upload your first image to the gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((img) => (
            <div key={img.fullPath} className="group relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 transition-all hover:shadow-md">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.fullPath)}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Delete Image"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
