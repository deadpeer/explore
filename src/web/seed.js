const append = (id, name, original, transcode = [], tags = []) => ({
  id,
  name,
  original,
  transcodes,
  tags,
})

const removeTag = (id, name) => {}
const removeVersion = (id, name) => {}

export const seed = [
  {
    id: '',
    name: 'hello',
    description: 'hello world',
    dateAdded: '',
    dateModified: '',
    original: {
      md5: '',
      mime: '',
    },
    versions: {
      'original-webm': {
        md5: '',
        mime: '',
        duration: '',
      },
    },
    tags: ['hello'],
  },
]
