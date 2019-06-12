const append = (id, name, original, transcode = [], tags = []) => ({
  id,
  name,
  original,
  transcodes,
  tags,
})

const removeTranscode = (id, transcodeName) => {}

export const seed = [
  {
    id: '',
    name: 'hello',
    dateAdded: '',
    dateModified: '',
    original: {
      md5: '',
      mime: '',
    },
    transcodes: {
      thumbnail: {
        md5: '',
        mime: '',
      },
    },
    tags: ['hello'],
    feeds: [],
  },
]
