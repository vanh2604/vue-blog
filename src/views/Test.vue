<template>
  <div class="create-post">
    <BlogPhotoPreview
      v-show="blogPhotoPreview"
      :blogPhotoFileURL="blogPhotoFileURL"
      v-on:togglePreview="togglePreview"
    />
    <Loading v-show="isLoading" />
    <div class="container">
      <div :class="{ invisible: !error }" class="err-message">
        <p><span>Error:</span>{{ this.errorMsg }}</p>
      </div>
      <div class="blog-info">
        <input type="text" placeholder="Enter Blog Title" v-model="blogTitle" />
        <div class="upload-file">
          <label for="blog-photo">Upload Cover Photo</label>
          <input type="file" ref="blogPhoto" id="blog-photo" @change="onChangeFile" accept=".png, .jpg, ,jpeg" />
          <button @click="togglePreview" class="preview" :class="{ 'button-inactive': !blogPhotoFileURL }">
            Preview Photo
          </button>
          <span>File Chosen: {{ blogPhotoName }}</span>
        </div>
      </div>
      <div class="editor">
        <vue-editor
          :editorOptions="editorSettings"
          v-model="blogHTML"
          useCustomImageHandler
          @image-added="imageHandler"
        />
      </div>
      <div @click="uploadHandler" class="blog-actions">
        <button>Save change</button>
      </div>
    </div>
  </div>
</template>

<script>
import Quill from 'quill';
import BlogPhotoPreview from '@/components/BlogPhotoPreview.vue';
import firebase from 'firebase/app';
import db from '../firebase/firebaseInit';
import 'firebase/firebase-storage';
window.Quill = Quill;
const ImageResize = require('quill-image-resize-module').default;
Quill.register('modules/imageResize', ImageResize);
import Loading from '@/components/Loading.vue';
export default {
  name: 'Test',
  components: {
    BlogPhotoPreview,
    Loading,
  },
  data() {
    return {
      error: null,
      errorMsg: '',
      editorSettings: {
        modules: {
          imageResize: {},
        },
      },
      routeId: null,
      blogHTML: '',
      blogTitle: '',
      blogPhotoName: '',
      blogPhotoFileURL: null,
      blogPhotoPreview: false,
      isLoading: false,
      file: null,
    };
  },
  computed: {
    profileId() {
      return this.$store.state.profileId;
    },
  },
  created() {
    this.routeId = this.$route.params.blogid;
    const currentBlog = this.$store.state.blogPosts.filter((post) => post.blogID === this.routeId);
    this.blogHTML = currentBlog[0].blogHTML;
    this.blogTitle = currentBlog[0].blogTitle;
    this.blogPhotoName = currentBlog[0].blogCoverPhotoName;
    this.blogPhotoFileURL = currentBlog[0].blogCoverPhoto;
  },
  methods: {
    onChangeFile() {
      const newFile = this.$refs.blogPhoto.files[0];
      this.file = newFile;
      this.blogPhotoName = newFile.name;
      this.blogPhotoFileURL = URL.createObjectURL(newFile);
    },
    togglePreview() {
      this.blogPhotoPreview = !this.blogPhotoPreview;
    },
    imageHandler(file, Editor, cursorLocation, resetUploader) {
      const storageRef = firebase.storage().ref();
      const docRef = storageRef.child(`documents/blogPostPhotos/${file.name}`);
      docRef.put(file).on(
        'state_changed',
        (snapshot) => {
          console.log(snapshot);
        },
        (err) => {
          console.log(err);
        },
        async () => {
          const downloadURL = await docRef.getDownloadURL();
          Editor.insertEmbed(cursorLocation, 'image', downloadURL);
          resetUploader();
        }
      );
    },
    async uploadHandler() {
      const dbRef = db.collection('blogPosts').doc(this.routeId);
      if (this.blogTitle.length !== 0 && this.blogHTML.length !== 0) {
        if (this.file) {
          this.isLoading = true;
          const storageRef = firebase.storage().ref();
          const docRef = storageRef.child(`documents/BlogCoverPhotos/${this.blogPhotoName}`);
          docRef.put(this.file).on(
            'state_changed',
            (snapshot) => {
              console.log(snapshot);
            },
            (err) => {
              console.log(err);
              this.loading = false;
            },
            async () => {
              const downloadURL = await docRef.getDownloadURL();
              await dbRef.update({
                blogTitle: this.blogTitle,
                blogHTML: this.blogHTML,
                blogCoverPhoto: downloadURL,
                blogCoverPhotoName: this.blogPhotoName,
              });
              await this.$store.dispatch('updatePost', this.routeId);
              this.loading = false;
              this.$router.push({ name: 'ViewBlog', params: { blogid: this.routeId } });
            }
          );
          return;
        }
        this.isLoading = true;
        await dbRef.update({
          blogTitle: this.blogTitle,
          blogHTML: this.blogHTML,
        });
        await this.$store.dispatch('updatePost', this.routeId);
        this.isLoading = false;
        this.$router.push({ name: 'ViewBlog', params: { blogid: this.routeId } });
        return;
      }
      this.error = true;
      this.errorMsg = 'please make sure you fill in blog title and blog content';
      setTimeout(() => {
        this.error = false;
      }, 5000);
    },
  },
};
</script>

<style lang="scss" scoped>
.create-post {
  position: relative;
  height: 100%;

  button {
    margin-top: 0px;
  }

  .router-button {
    text-decoration: none;
    color: #fff;
  }

  label,
  button,
  .router-button {
    transition: 0.5s ease-in-out all;
    align-self: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 20px;
    padding: 12px 24px;
    color: #fff;
    background-color: #303030;
    text-decoration: none;

    &:hover {
      background-color: rgba(48, 48, 48, 0.7);
    }
  }

  .container {
    position: relative;
    height: 100%;
    padding: 10px 25px 60px;
  }

  // error styling
  .invisible {
    opacity: 0 !important;
  }

  .err-message {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    color: #fff;
    margin-bottom: 10px;
    background-color: #303030;
    opacity: 1;
    transition: 0.5s ease all;

    p {
      font-size: 14px;
    }

    span {
      font-weight: 600;
    }
  }

  .blog-info {
    display: flex;
    margin-bottom: 32px;

    input:nth-child(1) {
      min-width: 300px;
    }

    input {
      transition: 0.5s ease-in-out all;
      padding: 10px 4px;
      border: none;
      border-bottom: 1px solid #303030;

      &:focus {
        outline: none;
        box-shadow: 0 1px 0 0 #303030;
      }
    }

    .upload-file {
      flex: 1;
      margin-left: 16px;
      position: relative;
      display: flex;

      input {
        display: none;
      }

      .preview {
        margin-left: 16px;
        text-transform: initial;
      }

      span {
        font-size: 12px;
        margin-left: 16px;
        align-self: center;
      }
    }
  }

  .editor {
    height: 60vh;
    display: flex;
    flex-direction: column;

    .quillWrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .ql-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: scroll;
    }

    .ql-editor {
      padding: 20px 16px 30px;
    }
  }

  .blog-actions {
    margin-top: 32px;

    button {
      margin-right: 16px;
    }
  }
}
</style>
