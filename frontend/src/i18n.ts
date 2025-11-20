import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 从 localStorage 读取用户语言；默认英文
const savedLang = localStorage.getItem('lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        common: {
          loading: 'Loading...',
          error: 'Error loading data',
        },
        header: {
          search_placeholder: 'Search videos...',
          upload: 'Upload',
          login: 'Login',
          logout: 'Logout',
        },
        upload: {
          need_login: 'You must log in before uploading a video.',
        },
        login: {
          title: 'Login',
          username: 'Username',
          password: 'Password',
          login_button: 'Login',
          signup_button: 'Sign up',
          back: 'Back',
        },
        register: {
          title: 'Create Account',
          email: 'Email',
          username: 'Username',
          password: 'Password',
          password_confirm: 'Confirm Password',
          password_mismatch: 'Passwords do not match',
          create: 'Create Account',
          back_to_login: 'Back to Login',
        },
        video: {
          like: 'Like',
          dislike: 'Dislike',
          comments: 'Comments',
          add_comment: 'Add a comment...',
          show_more: 'Show more',
          show_less: 'Show less',
          no_comments: 'No comments yet',
        },
      },
    },

    zh: {
      translation: {
        common: {
          loading: '加载中...',
          error: '加载失败',
        },
        header: {
          search_placeholder: '搜索视频...',
          upload: '上传',
          login: '登录',
          logout: '退出登录',
        },
        upload: {
          need_login: '请先登录才能上传视频。',
        },
        login: {
          title: '登录',
          username: '用户名',
          password: '密码',
          login_button: '登录',
          signup_button: '注册',
          back: '返回',
        },
        register: {
          title: '注册账号',
          email: '邮箱',
          username: '用户名',
          password: '密码',
          password_confirm: '确认密码',
          password_mismatch: '两次密码不一致',
          create: '创建账号',
          back_to_login: '返回登录',
        },
        video: {
          like: '点赞',
          dislike: '点踩',
          comments: '评论',
          add_comment: '添加评论...',
          show_more: '展开更多',
          show_less: '收起',
          no_comments: '暂无评论',
        },
      },
    },

    es: {
      translation: {
        common: {
          loading: 'Cargando...',
          error: 'Error al cargar datos',
        },
        header: {
          search_placeholder: 'Buscar videos...',
          upload: 'Subir',
          login: 'Iniciar sesión',
          logout: 'Cerrar sesión',
        },
        upload: {
          need_login: 'Debes iniciar sesión antes de subir videos.',
        },
        login: {
          title: 'Iniciar sesión',
          username: 'Usuario',
          password: 'Contraseña',
          login_button: 'Entrar',
          signup_button: 'Registrarse',
          back: 'Volver',
        },
        register: {
          title: 'Crear Cuenta',
          email: 'Correo electrónico',
          username: 'Nombre de usuario',
          password: 'Contraseña',
          password_confirm: 'Confirmar contraseña',
          password_mismatch: 'Las contraseñas no coinciden',
          create: 'Crear Cuenta',
          back_to_login: 'Volver a iniciar sesión',
        },
        video: {
          like: 'Me gusta',
          dislike: 'No me gusta',
          comments: 'Comentarios',
          add_comment: 'Añadir un comentario...',
          show_more: 'Mostrar más',
          show_less: 'Mostrar menos',
          no_comments: 'Sin comentarios',
        },
      },
    },
  },

  lng: savedLang,
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
