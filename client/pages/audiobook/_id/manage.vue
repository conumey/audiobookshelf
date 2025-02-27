<template>
  <div id="page-wrapper" class="bg-bg page p-8 overflow-auto relative" :class="streamLibraryItem ? 'streaming' : ''">
    <div class="flex items-center justify-center mb-6">
      <div class="w-full max-w-2xl">
        <p class="text-2xl mb-2">Audiobook File Management Tools</p>
      </div>
      <div class="w-full max-w-2xl">
        <div class="flex justify-end">
          <ui-dropdown v-model="selectedTool" :items="availableTools" :disabled="processing" class="max-w-sm" @input="selectedToolUpdated" />
        </div>
      </div>
    </div>

    <div class="flex justify-center">
      <div class="w-full max-w-2xl">
        <p class="text-xl mb-1">Metadata to embed</p>
        <p class="mb-2 text-base text-gray-300">audiobookshelf uses <a href="https://github.com/sandreas/tone" target="_blank" class="hover:underline text-blue-400 hover:text-blue-300">tone</a> to write metadata.</p>
      </div>
      <div class="w-full max-w-2xl"></div>
    </div>

    <div class="flex justify-center flex-wrap">
      <div class="w-full max-w-2xl border border-white border-opacity-10 bg-bg mx-2">
        <div class="flex py-2 px-4">
          <div class="w-1/3 text-xs font-semibold uppercase text-gray-200">Meta Tag</div>
          <div class="w-2/3 text-xs font-semibold uppercase text-gray-200">Value</div>
        </div>
        <div class="w-full max-h-72 overflow-auto">
          <template v-for="(value, key, index) in toneObject">
            <div :key="key" class="flex py-1 px-4 text-sm" :class="index % 2 === 0 ? 'bg-primary bg-opacity-25' : ''">
              <div class="w-1/3 font-semibold">{{ key }}</div>
              <div class="w-2/3">
                {{ value }}
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="w-full max-w-2xl border border-white border-opacity-10 bg-bg mx-2">
        <div class="flex py-2 px-4 bg-primary bg-opacity-25">
          <div class="flex-grow text-xs font-semibold uppercase text-gray-200">Chapter Title</div>
          <div class="w-24 text-xs font-semibold uppercase text-gray-200">Start</div>
          <div class="w-24 text-xs font-semibold uppercase text-gray-200">End</div>
        </div>
        <div class="w-full max-h-72 overflow-auto">
          <p v-if="!metadataChapters.length" class="py-5 text-center text-gray-200">No chapters</p>
          <template v-for="(chapter, index) in metadataChapters">
            <div :key="index" class="flex py-1 px-4 text-sm" :class="index % 2 === 1 ? 'bg-primary bg-opacity-25' : ''">
              <div class="flex-grow font-semibold">{{ chapter.title }}</div>
              <div class="w-24">
                {{ $secondsToTimestamp(chapter.start) }}
              </div>
              <div class="w-24">
                {{ $secondsToTimestamp(chapter.end) }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="w-full h-px bg-white bg-opacity-10 my-8" />

    <div class="w-full max-w-4xl mx-auto">
      <div v-if="selectedTool === 'embed'" class="w-full flex justify-end items-center mb-4">
        <ui-btn v-if="!isFinished" color="primary" :loading="processing" @click.stop="embedClick">Start Metadata Embed</ui-btn>
        <p v-else class="text-success text-lg font-semibold">Embed Finished!</p>
      </div>
      <div v-else class="w-full flex justify-end items-center mb-4">
        <ui-btn v-if="!isTaskFinished && processing" color="error" :loading="isCancelingEncode" class="mr-2" @click.stop="cancelEncodeClick">Cancel Encode</ui-btn>
        <ui-btn v-if="!isTaskFinished" color="primary" :loading="processing" @click.stop="encodeM4bClick">Start M4B Encode</ui-btn>
        <p v-else-if="taskFailed" class="text-error text-lg font-semibold">M4B Failed! {{ taskError }}</p>
        <p v-else class="text-success text-lg font-semibold">M4B Finished!</p>
      </div>

      <div class="mb-4">
        <div v-if="selectedTool === 'embed'" class="flex items-start mb-2">
          <span class="material-icons text-base text-warning pt-1">star</span>
          <p class="text-gray-200 ml-2">Metadata will be embedded on the audio tracks inside your audiobook folder.</p>
        </div>
        <div v-else class="flex items-start mb-2">
          <span class="material-icons text-base text-warning pt-1">star</span>
          <p class="text-gray-200 ml-2">
            Finished M4B will be put into your audiobook folder at <span class="rounded-md bg-neutral-600 text-sm text-white py-0.5 px-1 font-mono">.../{{ libraryItemRelPath }}/</span>.
          </p>
        </div>

        <div class="flex items-start mb-2">
          <span class="material-icons text-base text-warning pt-1">star</span>
          <p class="text-gray-200 ml-2">
            A backup of your original audio files will be stored in <span class="rounded-md bg-neutral-600 text-sm text-white py-0.5 px-1 font-mono">/metadata/cache/items/{{ libraryItemId }}/</span>. Make sure to periodically purge items cache.
          </p>
        </div>
        <div v-if="selectedTool === 'm4b'" class="flex items-start mb-2">
          <span class="material-icons text-base text-warning pt-1">star</span>
          <p class="text-gray-200 ml-2">Encoding can take up to 30 minutes.</p>
        </div>
        <div v-if="selectedTool === 'm4b'" class="flex items-start mb-2">
          <span class="material-icons text-base text-warning pt-1">star</span>
          <p class="text-gray-200 ml-2">If you have the watcher disabled you will need to re-scan this audiobook afterwards.</p>
        </div>
        <div class="flex items-start mb-2">
          <span class="material-icons text-base text-warning pt-1">star</span>
          <p class="text-gray-200 ml-2">Once the task is started you can navigate away from this page.</p>
        </div>
      </div>
    </div>

    <div class="w-full max-w-4xl mx-auto">
      <p class="mb-2 font-semibold">Audio Tracks</p>
      <div class="w-full mx-auto border border-white border-opacity-10 bg-bg">
        <div class="flex py-2 px-4 bg-primary bg-opacity-25">
          <div class="w-10 text-xs font-semibold text-gray-200">#</div>
          <div class="flex-grow text-xs font-semibold uppercase text-gray-200">Filename</div>
          <div class="w-16 text-xs font-semibold uppercase text-gray-200">Size</div>
          <div class="w-24"></div>
        </div>
        <template v-for="file in audioFiles">
          <div :key="file.index" class="flex py-2 px-4 text-sm" :class="file.index % 2 === 0 ? 'bg-primary bg-opacity-25' : ''">
            <div class="w-10">{{ file.index }}</div>
            <div class="flex-grow">
              {{ file.metadata.filename }}
            </div>
            <div class="w-16 font-mono text-gray-200">
              {{ $bytesPretty(file.metadata.size) }}
            </div>
            <div class="w-24">
              <div class="flex justify-center">
                <span v-if="audiofilesFinished[file.ino]" class="material-icons text-xl text-success leading-none">check_circle</span>
                <div v-else-if="audiofilesEncoding[file.ino]">
                  <widgets-loading-spinner />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ store, params, app, redirect, route }) {
    if (!store.state.user.user) {
      return redirect(`/login?redirect=${route.path}`)
    }
    if (!store.getters['user/getIsAdminOrUp']) {
      return redirect('/?error=unauthorized')
    }
    var libraryItem = await app.$axios.$get(`/api/items/${params.id}?expanded=1`).catch((error) => {
      console.error('Failed', error)
      return false
    })
    if (!libraryItem) {
      console.error('Not found...', params.id)
      return redirect('/?error=not found')
    }
    if (libraryItem.mediaType !== 'book') {
      console.error('Invalid media type')
      return redirect('/?error=invalid media type')
    }
    if (!libraryItem.media.audioFiles.length) {
      cnosole.error('No audio files')
      return redirect('/?error=no audio files')
    }
    return {
      libraryItem
    }
  },
  data() {
    return {
      processing: false,
      audiofilesEncoding: {},
      audiofilesFinished: {},
      isFinished: false,
      toneObject: null,
      selectedTool: 'embed',
      isCancelingEncode: false
    }
  },
  watch: {
    task: {
      handler(newVal) {
        if (newVal) {
          this.taskUpdated(newVal)
        }
      }
    }
  },
  computed: {
    libraryItemId() {
      return this.libraryItem.id
    },
    libraryItemRelPath() {
      return this.libraryItem.relPath
    },
    media() {
      return this.libraryItem.media || {}
    },
    mediaMetadata() {
      return this.media.metadata || {}
    },
    audioFiles() {
      return (this.media.audioFiles || []).filter((af) => !af.exclude && !af.invalid)
    },
    isSingleM4b() {
      return this.audioFiles.length === 1 && this.audioFiles[0].metadata.ext.toLowerCase() === '.m4b'
    },
    streamLibraryItem() {
      return this.$store.state.streamLibraryItem
    },
    metadataChapters() {
      return this.media.chapters || []
    },
    availableTools() {
      if (this.isSingleM4b) {
        return [{ value: 'embed', text: 'Embed Metadata' }]
      } else {
        return [
          { value: 'embed', text: 'Embed Metadata' },
          { value: 'm4b', text: 'M4B Encoder' }
        ]
      }
    },
    taskFailed() {
      return this.isTaskFinished && this.task.isFailed
    },
    taskError() {
      return this.taskFailed ? this.task.error || 'Unknown Error' : null
    },
    isTaskFinished() {
      return this.task && this.task.isFinished
    },
    task() {
      return this.$store.getters['tasks/getTaskByLibraryItemId'](this.libraryItemId)
    },
    taskRunning() {
      return this.task && !this.task.isFinished
    }
  },
  methods: {
    cancelEncodeClick() {
      this.isCancelingEncode = true
      this.$axios
        .$post(`/api/encode-m4b/${this.libraryItemId}/cancel`)
        .then(() => {
          this.$toast.success('Encode canceled')
        })
        .catch((error) => {
          console.error('Failed to cancel encode', error)
          this.$toast.error('Failed to cancel encode')
        })
        .finally(() => {
          this.isCancelingEncode = false
        })
    },
    encodeM4bClick() {
      this.processing = true
      this.$axios
        .$get(`/api/encode-m4b/${this.libraryItemId}`)
        .then(() => {
          console.log('Ab m4b merge started')
        })
        .catch((error) => {
          var errorMsg = error.response ? error.response.data || 'Unknown Error' : 'Unknown Error'
          this.$toast.error(errorMsg)
          this.processing = true
        })
    },
    embedClick() {
      const payload = {
        message: `Are you sure you want to embed metadata in ${this.audioFiles.length} audio files?`,
        callback: (confirmed) => {
          if (confirmed) {
            this.updateAudioFileMetadata()
          }
        },
        type: 'yesNo'
      }
      this.$store.commit('globals/setConfirmPrompt', payload)
    },
    updateAudioFileMetadata() {
      this.processing = true
      this.$axios
        .$get(`/api/items/${this.libraryItemId}/audio-metadata?tone=1`)
        .then(() => {
          console.log('Audio metadata encode started')
        })
        .catch((error) => {
          console.error('Audio metadata encode failed', error)
          this.processing = false
        })
    },
    audioMetadataStarted(data) {
      console.log('audio metadata started', data)
      if (data.libraryItemId !== this.libraryItemId) return
      this.audiofilesFinished = {}
    },
    audioMetadataFinished(data) {
      console.log('audio metadata finished', data)
      if (data.libraryItemId !== this.libraryItemId) return
      this.processing = false
      this.isFinished = true
      this.audiofilesEncoding = {}
      this.$toast.success('Audio file metadata updated')
    },
    audiofileMetadataStarted(data) {
      if (data.libraryItemId !== this.libraryItemId) return
      this.$set(this.audiofilesEncoding, data.ino, true)
    },
    audiofileMetadataFinished(data) {
      if (data.libraryItemId !== this.libraryItemId) return
      this.$set(this.audiofilesEncoding, data.ino, false)
      this.$set(this.audiofilesFinished, data.ino, true)
    },
    selectedToolUpdated() {
      let newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + `?tool=${this.selectedTool}`
      window.history.replaceState({ path: newurl }, '', newurl)
    },
    init() {
      this.fetchToneObject()
      if (this.$route.query.tool === 'm4b') {
        if (this.availableTools.some((t) => t.value === 'm4b')) {
          this.selectedTool = 'm4b'
        } else {
          this.selectedToolUpdated()
        }
      }

      if (this.task) this.taskUpdated(this.task)
    },
    fetchToneObject() {
      this.$axios
        .$get(`/api/items/${this.libraryItemId}/tone-object`)
        .then((toneObject) => {
          delete toneObject.CoverFile
          this.toneObject = toneObject
        })
        .catch((error) => {
          console.error('Failed to fetch tone object', error)
        })
    },
    taskUpdated(task) {
      this.processing = !task.isFinished
    }
  },
  mounted() {
    this.init()
    this.$root.socket.on('audio_metadata_started', this.audioMetadataStarted)
    this.$root.socket.on('audio_metadata_finished', this.audioMetadataFinished)
    this.$root.socket.on('audiofile_metadata_started', this.audiofileMetadataStarted)
    this.$root.socket.on('audiofile_metadata_finished', this.audiofileMetadataFinished)
  },
  beforeDestroy() {
    this.$root.socket.off('audio_metadata_started', this.audioMetadataStarted)
    this.$root.socket.off('audio_metadata_finished', this.audioMetadataFinished)
    this.$root.socket.off('audiofile_metadata_started', this.audiofileMetadataStarted)
    this.$root.socket.off('audiofile_metadata_finished', this.audiofileMetadataFinished)
  }
}
</script>