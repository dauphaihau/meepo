<template>

  <!--  Header-->
  <HeaderContentMenu title="Edit History"/>
  <div class="h-10"/>

  <div v-if="isLoading" class="flex-center min-h-[35vh]">
    <Loading variant="secondary" classes="h-7 w-7"/>
  </div>

  <div v-else>
    <div class="mb-4 relative z-[2]">
      <h1 class="text-xl font-bold ml-3 mb-2">Latest post</h1>
      <Post
          class="border-b"
          :dataPost="post"
          :pinStatus="post.pin_status"
      />
    </div>

    <!--  Previous Posts-->
    <div>
      <h1 class="text-xl font-bold ml-3 mb-2">Version history</h1>
      <Posts
          readonly
          hideInput
          :key="keyPostsComp"
          :author="author"
          :disabledComment="!post?.is_current_user_can_comment"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from 'dayjs';

import { postAPI } from "@/apis/post";
import Posts from "@/components/Posts.vue";
import Post from "@/components/Post.vue";
import Loading from "@/core/components/Loading.vue";

import { mapGetters } from "@/lib/map-state";
import { IPost } from "@/types/post";
import { useStore } from "@/store";
import { IUser } from "@/types/user";
import HeaderContentMenu from "@components/layout/HeaderMainContent.vue";
import { logger, parseJSON } from "@/core/helper";
import { parseCreatedAt } from "@/lib/dayjs-parse";
import { useWebSocket } from "@vueuse/core";

const router = useRouter()
const route = useRoute()
const store = useStore()

type PostTypes = {time?: string, date?: string} & IPost

const animationLikes = ref('initial')
const animationComments = ref('initial')
const post = ref<PostTypes | null>(null)
const author = ref<IUser | null>(null)
const keyPostsComp = ref(0)
const isLoading = ref(false)
const isLike = ref(false)
const guid = ref('')

const postId = route.params.id
const paramsPostId = route.params.id

const { isLoggedIn, getUser, getKeyMutatePosts } = mapGetters()

const { data, send } = useWebSocket(process.env.BASE_URL_WEBSOCKET, {
  autoReconnect: true,
  onConnected: () => {
    logger.info('Connected to websocket server - PostsChannel', 'src/components/pages/history-edited-posts.vue')
    guid.value = Math.random().toString(36).substring(2, 15)

    send(
        JSON.stringify({
          command: "subscribe",
          identifier: JSON.stringify({
            id: guid,
            channel: "PostsChannel",
          }),
        })
    );
  },
  onError: (e) => {
    logger.error('Something error with websocket server - PostsChannel', 'src/components/pages/history-edited-posts.vue')
  },
  onMessage: () => {
    const parsed = parseJSON<{type: string, message: any}>(data.value)
    if (!parsed) {
      logger.error('parse data is null', 'src/components/pages/history-edited-posts.vue')
      return
    }
    if (parsed.type === "ping") return;
    if (parsed.type === "welcome") return;
    if (parsed.type === "confirm_subscription") return;
    const message = parsed.message
    logger.debug('Websocket server response message - PostsChannel', message, 'src/components/pages/history-edited-posts.vue')

    if (!message) {
      return;
    }

    if (post.value.id === message.post.id) {

      if (message?.post.likes_count !== post.value.likes_count) {
        handleAnimationCount('likes_count')
      }

      if (message.post.sub_posts_count !== post.value.sub_posts_count) {
        handleAnimationCount('sub_posts_count')
      }

    }

    function handleAnimationCount(key) {
      const isUp = message.post[key] > post.value[key]
      // if (key === 'likes_count') {
      //   isLike.value = isUp
      // }
      let animation = key === 'likes_count' ? animationLikes : animationComments
      // 1. Old number goes up
      setTimeout(() => animation.value = isUp ? 'goUp' : 'goDown', 0);

      // 2. Incrementing the counter
      setTimeout(() => post.value[key] = message.post[key], 100);

      // 3. New number waits down
      setTimeout(() => animation.value = isUp ? 'waitUp' : 'waitDown', 0);

      // 4. New number stays in the middle
      setTimeout(() => animation.value = 'initial', 200);
    }
  }
})

onBeforeMount(() => {
  getDetailPost()
})

async function getDetailPost(post_id = null) {
  isLoading.value = true
  const { data } = await postAPI.detail(post_id ?? postId)
  isLoading.value = false

  if (data) {
    post.value = data.post

    post.value.author_avatar_url = data.post.author.avatar_url
    post.value.author_username = data.post.author.username
    post.value.author_username = data.post.author.username

    isLike.value = data.post.is_current_user_like
    post.value.time = dayjs(post.value.created_at).format('h:mm A  ')

    post.value = parseCreatedAt<IPost>(data.post)
    author.value = data.post.author
  }
}

watch(() => paramsPostId, (postId) => {
  getDetailPost(postId)
  keyPostsComp.value++
})

watch(getKeyMutatePosts, () => {
  getDetailPost()
})

</script>


<style scoped>

.goUp {
  display: inline-flex;
  opacity: 0;
  transform: translate3d(0, -20px, 0);
  transition: 0.1s ease-in-out;
}

.waitup {
  display: inline-flex;
  opacity: 0;
  transform: translate3d(0, 20px, 0);
}

.initial {
  display: inline-flex;
  opacity: 1;
  transform: translate3d(0, 0px, 0);
  transition: 0.1s ease-in-out;
}


.godown {
  display: inline-flex;
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  transition: 0.1s ease-in-out;
}

.waitdown {
  display: inline-flex;
  opacity: 0;
  transform: translate3d(0, -20px, 0);
}

.initial {
  display: inline-flex;
  opacity: 1;
  transform: translate3d(0, 0px, 0);
  transition: 0.1s ease-in-out;
}

.icon-btn {
  @apply flex items-center justify-center hover:bg-zinc-100 p-2 rounded-full mx-auto h-10 w-10  cursor-pointer transition transform duration-200 ease-in-out;
}
</style>
