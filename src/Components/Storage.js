import React, { useEffect, useState, useMemo } from "react";
import { storage, db } from "./Firebase";
import { getDownloadURL, ref, deleteObject } from "firebase/storage";
import { css } from "@emotion/css";
import Header from "./Header";
import Lightbox from "react-18-image-lightbox";
import "react-18-image-lightbox/style.css";
import { Button } from "@mui/material";

async function getImageSize(url) {
  let img = new Image();
  img.src = url;
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
  });
}

const Storage = () => {
  // [{ url, fileNameWithExt }, {  }, ...]
  const [urlWithFileNameWithExtLists, setUrlWithFileNameWithExtLists] =
    useState([]);

  const fileNameWithExts = useMemo(
    () =>
      urlWithFileNameWithExtLists.map(({ fileNameWithExt }) => fileNameWithExt),
    [urlWithFileNameWithExtLists]
  );
  // lightbox-react用 state
  const [photoIndex, setIndex] = useState(0);
  const [isOpen, setisOpen] = useState(false);

  // const { uid } = auth.currentUser;

  const handleDelete = async (fileNameWithExt) => {
    const gsReference_delete = ref(
      storage,
      `gs://pictures-storage-5b9d3.appspot.com/images/${fileNameWithExt}`
    );

    const querySnapshot = await db
      .collection("titles")
      .where("text", "==", `${fileNameWithExt}`)
      .get();

    querySnapshot.forEach((postDoc) => {
      // console.log(postDoc.id);
      db.collection("titles").doc(postDoc.id).delete();
    });

    deleteObject(gsReference_delete);
  };

  useEffect(() => {
    // db.collection("users").doc(uid).collection("titles").onSnapshot(async (snapshot) => { ... })
    db.collection("titles").onSnapshot(async (snapshot) =>
      // listsのデータがここで完成する
      {
        const fileNameWithExts = snapshot.docs
          .map((doc) => doc.data())
          .map((name) => {
            // console.log(name)
            return name.text;
          });

        // urlsのデータがここで完成する
        // [Promise, Promise, Promise, ...] => [{ url, fileNameWithExt }, ...]
        const urlWithFileNameWithExtLists = await Promise.all(
          fileNameWithExts.map(async (fileNameWithExt) => {
            const urls = `gs://pictures-storage-5b9d3.appspot.com/images/${fileNameWithExt}`;

            const gsReference = ref(storage, urls);

            const url = await getDownloadURL(gsReference).catch((err) =>
              console.log(err)
            );
            const imageSize = await getImageSize(url).catch((e) =>
              console.log(e.message)
            );

            return {
              url,
              fileNameWithExt,
              w: imageSize.width,
              h: imageSize.height,
            };
          })
        );

        setUrlWithFileNameWithExtLists(urlWithFileNameWithExtLists);
      }
    );
  }, []);

  return (
    <body
      className={css`
        /* background-color: #ebf0f6; */
      `}
    >
      <div
        className={css`
          overflow: hidden;
        `}
      >
        <Header
          className={css`
            position: fixed;
          `}
        />
        <main
          css={css`
            display: flex;
          `}
        >
          <div className="content">
            <div
              className={css`
                height: 1v;
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                gap: 60px 40px;
              `}
            >
              {urlWithFileNameWithExtLists.map(
                ({ url, fileNameWithExt, w, h }, index) => (
                  <div
                    key={url}
                    className={css`
                      position: relative;
                      justify-content: space-between;
                    `}
                  >
                    <div
                      className={css`
                        position: relative;
                        height: auto;
                        width: 200px;
                      `}
                    >
                      <img
                        src={url}
                        alt="nothing"
                        className={css`
                          &:hover {
                            cursor: pointer;
                            opacity: 0.4;
                          }
                          width: 100%;
                          height: 100%;

                          border: 10px solid #d1d1d1;
                          border-style: outset;
                        `}
                      />
                      <div
                        className={css`
                          position: absolute;
                          top: 0;
                          bottom: 0;
                          width: 100%;
                          height: 100%;
                          opacity: 0;
                          transition: 0.5s;
                          cursor: pointer;
                          &:hover {
                            opacity: 1;
                            transition: 0.5s;
                          }
                        `}
                        onClick={() => {
                          setisOpen(true);
                          setIndex(index);
                        }}
                      >
                        <span
                          className={css`
                            display: block;
                            text-align: center;
                            font-size: 18px;
                            color: black;
                            font-weight: bold;
                          `}
                        >
                          {fileNameWithExt} <br />
                          {w + "x" + h}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete(fileNameWithExt)}
                      className={css`
                        position: absolute;
                        left: 80px;
                        top: -20px;
                      `}
                    >
                      delete!
                    </Button>
                    {isOpen && (
                      <Lightbox
                        mainSrc={urlWithFileNameWithExtLists[photoIndex].url}
                        nextSrc={
                          urlWithFileNameWithExtLists[
                            (photoIndex + 1) % fileNameWithExts.length
                          ].url
                        }
                        prevSrc={
                          urlWithFileNameWithExtLists[
                            (photoIndex + fileNameWithExts.length - 1) %
                              fileNameWithExts.length
                          ].url
                        }
                        onCloseRequest={() => setisOpen(false)}
                        onMovePrevRequest={() =>
                          setIndex(
                            (photoIndex + fileNameWithExts.length - 1) %
                              fileNameWithExts.length
                          )
                        }
                        onMoveNextRequest={() =>
                          setIndex((photoIndex + 1) % fileNameWithExts.length)
                        }
                        imageTitle={fileNameWithExts[photoIndex]}
                        imageCaption={fileNameWithExts[photoIndex]}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </body>
  );
};

export default Storage;
