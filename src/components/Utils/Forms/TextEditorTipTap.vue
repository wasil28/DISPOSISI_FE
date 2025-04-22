<script lang="ts" setup>
import { Placeholder } from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'

const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const editorContent = ref(props.modelValue)
const editor = useEditor({
  content: editorContent.value,
  extensions: [
    TiptapStarterKit,
    TiptapBulletList,
    TiptapOrderedList,
    TiptapListItem,
    Placeholder.configure({
      placeholder: 'Ketik sesuatu...',  // Ganti dengan placeholder yang diinginkan
    }),
    Table.configure({
      resizable: true,  // Menyediakan fitur untuk mengubah ukuran tabel
    }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  onUpdate: ({ editor }) => {
    editorContent.value = editor.getHTML()
    emit('update:modelValue', editor.getHTML())
  },
})

onBeforeUnmount(() => {
  if (editorContent.value)
    unref(editor).destroy()
})


const showTableOptions = ref(false)

</script>

<template>
  <div>
    <div v-if="editor" class="container">
      <div class="control-group">
        <div class="button-group grid grid-cols-8">
          <button type="button" :disabled="!editor.can().chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }" class="editor-button"
            @click="editor.chain().focus().toggleBold().run()">
            <i class="i-mdi-format-bold" />
          </button>

          <button type="button" :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }" class="editor-button"
            @click="editor.chain().focus().toggleItalic().run()">
            <i class="i-mdi-format-italic" />
          </button>

          <!-- <button
            type="button"
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
            class="editor-button"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <i class="i-mdi-format-strikethrough" />
          </button> -->

          <button type="button" :class="{ 'is-active': editor.isActive('bulletList') }" class="editor-button"
            @click="editor.chain().focus().toggleBulletList().run()">
            <i class="i-mdi-format-list-bulleted" />
          </button>

          <button type="button" :class="{ 'is-active': editor.isActive('orderedList') }" class="editor-button"
            @click="editor.chain().focus().toggleOrderedList().run()">
            <i class="i-mdi-format-list-numbered" />
          </button>

          <button type="button" class="editor-button" @click="editor.chain().focus().setHardBreak().run()">
            <i class="i-mdi-format-line-spacing" />
          </button>
          <button type="button" :disabled="!editor.can().chain().focus().undo().run()" class="editor-button"
            @click="editor.chain().focus().undo().run()">
            <i class="i-mdi-undo" />
          </button>

          <button type="button" :disabled="!editor.can().chain().focus().redo().run()" class="editor-button"
            @click="editor.chain().focus().redo().run()">
            <i class="i-mdi-redo" />
          </button>

            <button type="button" class="editor-button" @click="showTableOptions = !showTableOptions">
                <i :class="showTableOptions ? 'i-mdi-table-collapse' : 'i-mdi-table'"></i>
            </button>


          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()">
            <i class="i-mdi-table" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().addColumnBefore().run()">
            <i class="i-mdi-table-column" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().addColumnAfter().run()">
            <i class="i-mdi-table-column-plus-after" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().deleteColumn().run()">
            <i class="i-mdi-table-column-remove" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().addRowBefore().run()">
            <i class="i-mdi-table-row-plus-before" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().addRowAfter().run()">
            <i class="i-mdi-table-row-plus-after" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().deleteRow().run()">
            <i class="i-mdi-table-row-remove" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().deleteTable().run()">
            <i class="i-mdi-table-remove" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().mergeCells().run()">
            <i class="i-mdi-table-merge-cells" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().splitCell().run()">
            <i class="i-mdi-table-split-cell" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().toggleHeaderColumn().run()">
            <i class="i-mdi-table-column" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().toggleHeaderRow().run()">
            <i class="i-mdi-table-row" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().toggleHeaderCell().run()">
            <i class="i-mdi-table-cell" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().mergeOrSplit().run()">
            <i class="i-mdi-table-merge-cells" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().setCellAttribute('colspan', 2).run()">
            <i class="i-mdi-table-column-width" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().fixTables().run()">
            <i class="i-mdi-table-refresh" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().goToNextCell().run()">
            <i class="i-mdi-arrow-right" />
          </button>
          <button v-if="showTableOptions" type="button" class="editor-button"
            @click="editor.chain().focus().goToPreviousCell().run()">
            <i class="i-mdi-arrow-left" />
          </button>

        </div>
      </div>
    </div>
    <TiptapEditorContent :editor="editor" class="tiptap-editor border-solid border-2 border-gray-200 !h-36" />
  </div>

  <!-- Hasil Valuenya : {{ editorContent }} -->
</template>

<style lang="scss">
/* ... */

.editor-button {
  /* Gaya untuk tombol */
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: #eee;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  /* Gaya saat tombol aktif */
  &.is-active {
    background-color: #333;
    color: #fff;
  }

  /* Gaya saat tombol dinonaktifkan */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Gaya saat tombol dihover */
  &:hover:not(:disabled) {
    background-color: #ddd;
  }
}

.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;
    // list-style-type: disc;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}

/* ... */
</style>
