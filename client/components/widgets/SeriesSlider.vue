<template>
  <div class="w-full">
    <div class="flex items-center py-3">
      <slot />
      <div class="flex-grow" />
      <button v-if="isScrollable" class="w-8 h-8 mx-1 flex items-center justify-center rounded-full" :class="canScrollLeft ? 'hover:bg-white hover:bg-opacity-5 text-gray-300 hover:text-white' : 'text-white text-opacity-40 cursor-text'" @click="scrollLeft">
        <span class="material-icons text-2xl">chevron_left</span>
      </button>
      <button v-if="isScrollable" class="w-8 h-8 mx-1 flex items-center justify-center rounded-full" :class="canScrollRight ? 'hover:bg-white hover:bg-opacity-5 text-gray-300 hover:text-white' : 'text-white text-opacity-40 cursor-text'" @click="scrollRight">
        <span class="material-icons text-2xl">chevron_right</span>
      </button>
    </div>
    <div ref="slider" class="w-full overflow-y-hidden overflow-x-auto no-scroll -mx-2" style="scroll-behavior: smooth" @scroll="scrolled">
      <div class="flex" :style="{ height: height + 'px' }">
        <template v-for="(item, index) in items">
          <cards-lazy-series-card :key="item.id" :ref="`slider-item-${item.id}`" :index="index" :series-mount="item" :height="cardHeight" :width="cardWidth" :book-cover-aspect-ratio="bookCoverAspectRatio" :bookshelf-view="$constants.BookshelfView.TITLES" class="relative mx-2" @hook:updated="setScrollVars" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 192
    },
    bookshelfView: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      isScrollable: false,
      canScrollLeft: false,
      canScrollRight: false,
      clientWidth: 0
    }
  },
  computed: {
    bookCoverAspectRatio() {
      return this.$store.getters['libraries/getBookCoverAspectRatio']
    },
    cardScaleMulitiplier() {
      return this.height / 192
    },
    cardHeight() {
      return this.height - 40 * this.cardScaleMulitiplier
    },
    cardWidth() {
      return 2 * (this.cardHeight / this.bookCoverAspectRatio)
    },
    booksPerPage() {
      return Math.floor(this.clientWidth / (this.cardWidth + 16))
    },
    isSelectionMode() {
      return this.$store.getters['getNumLibraryItemsSelected'] > 0
    }
  },
  methods: {
    scrolled() {
      this.setScrollVars()
    },
    scrollRight() {
      if (!this.canScrollRight) return
      const slider = this.$refs.slider
      if (!slider) return
      const scrollAmount = this.booksPerPage * this.cardWidth
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth

      const newScrollLeft = Math.min(maxScrollLeft, slider.scrollLeft + scrollAmount)
      slider.scrollLeft = newScrollLeft
    },
    scrollLeft() {
      if (!this.canScrollLeft) return
      const slider = this.$refs.slider
      if (!slider) return

      const scrollAmount = this.booksPerPage * this.cardWidth

      const newScrollLeft = Math.max(0, slider.scrollLeft - scrollAmount)
      slider.scrollLeft = newScrollLeft
    },
    setScrollVars() {
      const slider = this.$refs.slider
      if (!slider) return
      const { scrollLeft, scrollWidth, clientWidth } = slider
      const scrollPercent = (scrollLeft + clientWidth) / scrollWidth

      this.clientWidth = clientWidth
      this.isScrollable = scrollWidth > clientWidth
      this.canScrollRight = scrollPercent < 1
      this.canScrollLeft = scrollLeft > 0
    }
  },
  updated() {
    this.setScrollVars()
  },
  mounted() {},
  beforeDestroy() {}
}
</script>