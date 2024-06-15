import { useWebSocket } from '@vueuse/core';
import { parseJSON } from '@core/helpers/common.ts';
import type { IResponseDataMessageChannel } from '@/types/chat.ts';
import { logger } from '@core/helpers/logger.ts';

type Callback = (msd: IResponseDataMessageChannel['message']) => void;

export default function useRealtimeMessage(cb: Callback) {
  const { data, send } = useWebSocket(import.meta.env.VITE_BASE_URL_WEBSOCKET, {
    autoReconnect: true,
    onConnected: () => {
      logger.info('Connected to websocket server - MessagesChannel', 'src/composables/useRealtimeMessage.vue');
      const guid = Math.random().toString(36).substring(2, 15);
      send(
        JSON.stringify({
          command: 'subscribe',
          identifier: JSON.stringify({
            id: guid,
            channel: 'MessagesChannel',
          }),
        })
      );
    },
    onError: () => {
      logger.error('Something error with websocket server - MessagesChannel', 'src/composables/useRealtimeMessage.vue');
    },
    onMessage: () => {
      const parsed = parseJSON<IResponseDataMessageChannel>(data.value);
      if (parsed.type === 'ping') return;
      if (parsed.type === 'welcome') return;
      if (parsed.type === 'confirm_subscription') return;
      const messageRecord = parsed.message;
      if (!messageRecord) {
        logger.error('Parse message is undefined - MessagesChannel', 'src/composables/useRealtimeMessage.vue');
        return;
      }
      logger.debug('Response message - MessagesChannel', messageRecord, 'src/composables/useRealtimeMessage.vue');
      cb(messageRecord);
    },
  });
}
