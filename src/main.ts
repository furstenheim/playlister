import App from './routes/App.svelte'
const app = new App({
  target: document.body,
  props: {
    name: 'playlister'
  }
})

export default app