"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Download,
  Trash2,
  Eye
} from "lucide-react";

interface Attachment {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  uploadedAt: number;
}

interface AttachmentUploadProps {
  taskId: string;
  onUploadComplete?: (attachment: Attachment) => void;
  className?: string;
}

export function AttachmentUpload({ taskId, onUploadComplete, className = "" }: AttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('taskId', taskId);
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      // Create a promise to handle the response
      const uploadPromise = new Promise<Attachment>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.open('POST', `/api/attachments`);
      xhr.send(formData);

      const attachment = await uploadPromise;
      onUploadComplete?.(attachment);
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Uploading file...</p>
                    <Progress value={uploadProgress} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Paperclip className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Drop file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max file size: 10MB. Allowed: Images, PDFs, Documents
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Choose File
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.json"
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AttachmentListProps {
  attachments: Attachment[];
  onAttachmentDelete?: (attachmentId: number) => void;
  className?: string;
}

export function AttachmentList({ 
  attachments, 
  onAttachmentDelete, 
  className = "" 
}: AttachmentListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const handleDownload = (attachment: Attachment) => {
    window.open(`/${attachment.filePath}`, '_blank');
  };

  const handlePreview = (attachment: Attachment) => {
    if (attachment.mimeType.startsWith('image/')) {
      window.open(`/${attachment.filePath}`, '_blank');
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      const response = await fetch(`/api/attachments?id=${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onAttachmentDelete?.(attachmentId);
      } else {
        console.error('Failed to delete attachment');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">Attachments</h4>
      {attachments.map((attachment) => (
        <motion.div
          key={attachment.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          layout
        >
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.originalName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(attachment.size)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {attachment.mimeType.startsWith('image/') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreview(attachment)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(attachment)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {onAttachmentDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(attachment.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
