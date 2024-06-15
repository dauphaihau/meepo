import { useWebSocket } from '@vueuse/core';
import { parseJSON } from '@core/helpers/common.ts';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IResponseGetPost } from '@/types/post.ts';
import { logger } from '@core/helpers/logger.ts';

interface ResponseDataMessage {
  type: string
  message: {
    post: IResponseGetPost
  }
}

export default function useRealtimePost(post: Ref<IResponseGetPost>) {
  const animationLikes = ref('counter-number-initial');
  const animationComments = ref('counter-number-initial');

  const { data, send } = useWebSocket(import.meta.env.VITE_BASE_URL_WEBSOCKET, {
    autoReconnect: true,
    onConnected: () => {
      logger.info('Connected to websocket server - PostsChannel', 'src/composables/useRealtimePost.vue');
      const guid = Math.random().toString(36).substring(2, 15);

      send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({
            id: guid,
            channel: 'PostsChannel',
          }),
        })
      );
    },
    onError: () => {
      logger.error('Something error with websocket server - PostsChannel', 'src/composables/useRealtimePost.vue');
    },
    onMessage: () => {
      const parsed = parseJSON<ResponseDataMessage>(data.value);
      if (!parsed) {
        logger.error('parse data is null', 'src/composables/useRealtimePost.vue');
        return;
      }
      if (parsed.type === 'ping') return;
      if (parsed.type === 'welcome') return;
      if (parsed.type === 'confirm_subscription') return;
      const message = parsed.message;
      logger.debug('Websocket server response message - PostsChannel', message, 'src/composables/useRealtimePost.vue');

      if (!message) {
        logger.error('message is undefined - PostsChannel', 'src/composables/useRealtimePost.vue');
        return;
      }

      if (post.value.id === message.post.id) {
        if (message?.post.likes_count !== post.value.likes_count) {
          handleAnimationCount('likes_count');
        }

        if (message.post.sub_posts_count !== post.value.sub_posts_count) {
          handleAnimationCount('sub_posts_count');
        }
      }

      function handleAnimationCount(key: string) {
        const isUp = message.post[key] > post.value[key];

        const animation = key === 'likes_count' ? animationLikes : animationComments;

        // 1. Old number goes up
        setTimeout(() => animation.value = isUp ? 'counter-number-goUp' : 'counter-number-goDown', 0);

        // 2. Incrementing the counter
        setTimeout(() => {
          post.value[key] = message.post[key];
        }, 100);

        // 3. New number waits down
        setTimeout(() => animation.value = isUp ? 'counter-number-waitUp' : 'counter-number-waitDown', 0);

        // 4. New number stays in the middle
        setTimeout(() => animation.value = 'counter-number-initial', 200);
      }
    },
  });

  return { animationLikes, animationComments };
}
