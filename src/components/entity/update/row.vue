<!--
Copyright 2023 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/getodk/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <tr class="entity-update-row">
    <td class="label-cell">
      <label :for="textareaId" v-tooltip.text>
        {{ requiredLabel(label, required) }}
      </label>
    </td>
    <td class="old-value" :class="{ empty: oldIsEmpty }">
      <div ref="oldValueContainer">
        {{ oldIsEmpty ? $t('common.emptyValue') : oldValue }}
      </div>
    </td>
    <td class="new-value">
      <div class="form-group">
        <textarea-autosize :id="textareaId" ref="textarea"
          :class="{ 'uncommitted-change': modelValue != null }"
          :model-value="modelValue ?? oldValue ?? ''" :min-height="minHeight"
          :required="required" @update:model-value="update"/>
      </div>
    </td>
  </tr>
</template>

<script>
let id = 0;

export default {
  name: 'EntityUpdateRow'
};
</script>
<script setup>
import { computed, ref, watch } from 'vue';

import TextareaAutosize from '../../textarea-autosize.vue';

import { requiredLabel } from '../../../util/dom';

const props = defineProps({
  modelValue: String,
  oldValue: String,
  label: {
    type: String,
    required: true
  },
  required: Boolean
});
const emit = defineEmits(['update:modelValue']);

const oldIsEmpty = computed(() =>
  props.oldValue == null || props.oldValue === '');

id += 1;
const textareaId = `entity-update-row-textarea${id}`;

const minHeight = ref(0);
let minHeightOutdated = true;
const oldValueContainer = ref(null);
const setMinHeight = () => {
  minHeight.value = oldValueContainer.value.getBoundingClientRect().height;
  minHeightOutdated = false;
};
watch(() => props.oldValue, () => { minHeightOutdated = true; });

const update = (value) => {
  // We emit `undefined` if `value` is the same as props.oldValue. If `value` is
  // an empty string, and props.oldValue is nullish, the two are considered to
  // be the same. We emit `undefined` rather than `null` so that axios won't
  // send the value.
  emit('update:modelValue', value !== (props.oldValue ?? '') ? value : undefined);
};

const textarea = ref(null);
const resize = () => {
  textarea.value.resize();
  if (minHeightOutdated) setMinHeight();
};
const focus = () => textarea.value.focus();
defineExpose({
  textarea: { resize, focus }
});
</script>

<style lang="scss">
@import '../../../assets/scss/mixins';

.entity-update-row {
  td, textarea { font-size: 16px; }

  $vpadding: 4px;
  .label-cell, .old-value, .new-value { padding-bottom: $vpadding; }
  .label-cell {
    padding-left: $padding-left-modal-header;
    padding-right: 15px;
  }
  .new-value {
    padding-right: $padding-left-modal-header;
    padding-top: $vpadding;
  }
  .label-cell, .old-value {
    padding-top: #{$vpadding + $padding-top-form-control};
  }

  .label-cell { @include text-overflow-ellipsis; }
  label {
    // Needed for the text to truncate.
    display: inline;
    margin-bottom: 0;
  }

  .old-value {
    overflow-wrap: break-word;
    white-space: break-spaces;

    &.empty {
      color: #999;
      font-style: italic;
    }
  }

  .form-group {
    margin-bottom: 0;
    padding-bottom: 0;
  }
}
</style>