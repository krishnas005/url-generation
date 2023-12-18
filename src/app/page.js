"use client"

import { initializeApp } from "firebase/app";
import { firebaseConfig, firebaseStorageURL } from "@/env";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useState } from "react";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app, firebaseStorageURL);

const createUniqueFileName = (getFile) => {
  const timeStamp = Date.now();
  const randomStringValue = Math.random().toString(36).substring(2, 12);

  return `${getFile.name}-${timeStamp}-${randomStringValue}`;
};

async function helperForUploadingImageToFirebase(file) {
  const getFileName = createUniqueFileName(file);
  const storageReference = ref(storage, `${getFileName}`);
  const uploadImage = uploadBytesResumable(storageReference, file);

  return new Promise((resolve, reject) => {
    uploadImage.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.log(error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadImage.snapshot.ref)
          .then((downloadUrl) => resolve(downloadUrl))
          .catch((error) => reject(error));
      }
    );
  });
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");

  async function handleImage(event) {
    const extractImageUrl = await helperForUploadingImageToFirebase(
      event.target.files[0]
    );
    setImageUrl(extractImageUrl);
  }

  return (
    <main className=" min-h-screen  items-center  p-4 md:p-24 max-sm:m-12 ">
      <div className="flex flex-col md:flex-row justify-between ">
      <div className="rounded-md shadow-md border p-6">
      <div className=" font-serif text-3xl font-semibold   p-4  ">
        <span className="block">Upload your image,</span>
        <span className="block">video or any file</span>
        <span className="block">to get a generated url</span>
      </div>
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
        <div className="p-6">
        <label htmlFor="img" className="block text-lg font-semibold mb-4">
          Upload here:
        </label>
        <input
          max="1000000"
          type="file"
          onChange={handleImage}
          id="img"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
        </div>
      </div>
      </div>
      <div className="items-center mt-10">
      {imageUrl && (
          <div className="mt-6 p-4 bg-green-100 rounded-md">
            <p className="text-green-700 font-semibold">Image uploaded successfully!</p>
            <p className="mt-2 text-blue-700 break-all">{imageUrl}</p>
          </div>
        )}
      </div>
    </main>
  );
}
