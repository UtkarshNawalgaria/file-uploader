import { nanoid } from "nanoid";
import { useState } from "react";

type UploadedFile = {
  id: string;
  file: File;
  upload: number;
};

const CHUNK_SIZE = 1024;

export default function FileUploader({ maxFiles }: { maxFiles: number }) {
  const [fileList, setFileList] = useState<UploadedFile[]>([]);

  async function sendChunkToServer(chunk: ArrayBuffer, fileName: string) {
    try {
      await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": "" + chunk.byteLength,
          "file-name": fileName,
        },
        body: chunk,
      });

      return [true, null];
    } catch (error) {
      return [null, error];
    }
  }

  async function uploadAndTrackFiles(files: UploadedFile[]) {
    files.forEach((fileObj) => {
      const fileReader = new FileReader();

      fileReader.onload = async (ev) => {
        const fileArrayBuffer = ev.target?.result as ArrayBuffer;
        const chunkCount = fileArrayBuffer.byteLength / CHUNK_SIZE;

        for (let chunkId = 0; chunkId < chunkCount + 1; chunkId++) {
          const chunk = fileArrayBuffer.slice(
            CHUNK_SIZE * chunkId,
            CHUNK_SIZE * chunkId + CHUNK_SIZE
          );

          const [data] = await sendChunkToServer(chunk, fileObj.file.name);

          if (!data) continue;

          // Update upload percentage for each file
          setFileList((list) => {
            const newList = list.map((item) => {
              if (item.id === fileObj.id) {
                return {
                  ...item,
                  upload: Math.round(
                    Math.min((chunkId * 100) / chunkCount, 100)
                  ),
                };
              }

              return item;
            });

            return newList;
          });
        }
      };

      fileReader.readAsArrayBuffer(fileObj.file);
    });
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    if (!event.target.files) return;

    const uploadedFiles: UploadedFile[] = [];

    for (const file of event.target.files) {
      uploadedFiles.push({
        id: nanoid(),
        file: file,
        upload: 0,
      });
    }

    setFileList(uploadedFiles);
    uploadAndTrackFiles(uploadedFiles);
  }

  return (
    <div className="flex justify-center h-screen items-center">
      <div className="flex flex-col gap-10">
        <div className="flex justify-center">
          <label
            htmlFor="fileUploader"
            className="text-center cursor-pointer px-10 py-5 bg-slate-800 rounded-md text-white"
          >
            Upload Files
            <input
              type="file"
              name="fileUploader"
              id="fileUploader"
              multiple
              max={maxFiles}
              className="h-0 w-0"
              onChange={handleFileSelect}
            />
          </label>
        </div>
        {fileList?.length ? (
          <div className="border border-slate-800 rounded-md p-10 flex flex-col gap-4">
            {fileList.map((fileObj) => (
              <div
                key={fileObj.file.name}
                className="bg-slate-300 rounded-md px-5 py-2 flex flex-col gap-5"
              >
                <div className="flex justify-between items-center gap-20">
                  <span>{fileObj.file.name}</span>
                  <span>{fileObj.upload}%</span>
                </div>
                <div
                  id="progress-bar"
                  className="relative h-1 w-full border border-slate-800 rounded-full"
                >
                  <span
                    className={`absolute h-full bg-slate-800 left-0 right-0`}
                    style={{
                      width: `${fileObj.upload}%`,
                    }}
                  ></span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
