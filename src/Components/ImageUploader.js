import { Button, IconButton } from "@mui/material";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import { ref, uploadBytesResumable } from "firebase/storage";
import React from "react";
import { storage, db } from "./Firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { css } from "@emotion/css";

const ImageUploader = () => {
  const onFileUploadtoFirebase = async (e) => {
    const file = e.target.files[0];
    const isAlreadyExist = await db
      .collection("titles")
      .where("text", "==", file.name)
      .get()
      .then((querySnapshot) => querySnapshot.docs.length !== 0);

    if (isAlreadyExist) {
      toast("すでにアップロードしてます！！");
      return;
    } else {
      const storageRef = ref(storage, "images/" + file.name);

      const uploadImage = uploadBytesResumable(storageRef, file);

      uploadImage.on(
        "state_changed",
        (snapshot) => {
          // setLoading(true);
        },
        (err) => {
          console.log("err");
        },
        () => {
          toast("アップロードしました！！");

          db.collection("titles").add({
            text: file.name,
            // id: nanoid(),
            // createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          // db.collection("users").doc(uid).collection("titles").add({ ... })
        }
      );
    }
  };

  return (
    <div>
      <Button variant="contained" component="label">
        Upload
        <input
          hidden
          accept=".png, .jpeg, .jpg"
          multiple
          type="file"
          onChange={onFileUploadtoFirebase}
          onClick={(e) => {
            e.target.value = "";
          }}
        />
        <IconButton color="primary" aria-label="add to shopping cart">
          <AddToPhotosIcon
            className={css`
              color: white;
            `}
          />
        </IconButton>
      </Button>
      <ToastContainer />
    </div>
  );
};

export default ImageUploader;
