import { mount } from '@vue/test-utils';
import HomePost from '@components/pages/home/HomePost.vue';

const mockDataPost = {
  id: 1051,
  content: 'content',
  created_at: '2024-06-11T07:52:35.519Z',
  updated_at: '2024-06-11T07:52:35.519Z',
  sub_posts_count: 0,
  parent_id: null,
  image_url: null,
  likes_count: 0,
  user_id: 358,
  edited_parent_id: null,
  edited_posts_count: 0,
  author: {
    name: 'Minhh',
    username: 'minhminh',
    avatar_url: 'http://res.cloudinary.com/duiehrbms/image/upload/v1718092862/meepo/cvg8fp0kc4b2jjj7umrr.png',
    id: 358,
    by: null,
    followed_count: 4,
    followers_count: 0,
  },
  comments_count: 0,
  who_can_comment_int: 0,
  is_current_user_like: false,
  is_current_user_can_comment: true,
};

describe('HomePost component', () => {
  test('mount post', () => {
    const content = 'new post';
    mockDataPost.content = content;
    const wrapper = mount(HomePost, {
      props: {
        dataPost: mockDataPost,
      },
    });
    expect(wrapper.find('[data-test="content"]').text()).toBe(content);
  });

  test('redirect to post page', async () => {
    const wrapper = mount(HomePost, {
      props: {
        dataPost: mockDataPost,
      },
    });
    await wrapper.get('#post').trigger('click');
    expect(wrapper.vm.$route.name).toBe('post');
  });
});
