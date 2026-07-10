import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import Modifier from 'draft-js/lib/DraftModifier';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { useTranslation } from 'react-i18next';

import { useStyles } from './richTextStyles';

const defaultOptions = {
  options: ['inline', 'list', 'blockType'],
  inline: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['bold', 'italic'],
  },
  list: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['unordered', 'ordered'],
  },
  blockType: {
    inDropdown: false,
    options: ['H1', 'H2'],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  // colorPicker: {
  //   // icon: color,
  //   className: undefined,
  //   component: undefined,
  //   popupClassName: undefined,
  //   colors: [
  //     'rgb(97,189,109)',
  //     'rgb(26,188,156)',
  //     'rgb(84,172,210)',
  //     'rgb(44,130,201)',
  //     'rgb(147,101,184)',
  //     'rgb(71,85,119)',
  //     'rgb(204,204,204)',
  //     'rgb(65,168,95)',
  //     'rgb(0,168,133)',
  //     'rgb(61,142,185)',
  //     'rgb(41,105,176)',
  //     'rgb(85,57,130)',
  //     'rgb(40,50,78)',
  //     'rgb(0,0,0)',
  //     'rgb(247,218,100)',
  //     'rgb(251,160,38)',
  //     'rgb(235,107,86)',
  //     'rgb(226,80,65)',
  //     'rgb(163,143,132)',
  //     'rgb(239,239,239)',
  //     'rgb(255,255,255)',
  //     'rgb(250,197,28)',
  //     'rgb(243,121,52)',
  //     'rgb(209,72,65)',
  //     'rgb(184,49,47)',
  //     'rgb(124,112,107)',
  //     'rgb(209,213,216)',
  //   ],
  // },
};

export const convertDataToHtml = (data) => {
  if (!data) return null;

  if (typeof data === 'string') {
    return data.trim() || null;
  }

  if (typeof data.getCurrentContent !== 'function') {
    return null;
  }

  const contentState = data.getCurrentContent();

  const plainText = contentState.getPlainText('');

  if (!plainText) return null;

  let html = draftToHtml(convertToRaw(data?.getCurrentContent()));

  html = html
    .replace(/<p><br><\/p>/g, '<br>') // Empty paragraphs → <br>
    .replace(/<p><\/p>/g, '<br>') // Empty paragraphs → <br>
    .replace(/<p>(.*?)<br><\/p>/g, '<p>$1</p><br>') // Remove inline <br> inside <p>
    .replace(/\n/g, ''); // Remove newlines

  return html;
};

export const getPlainTextOfDraft = (data) => {
  const contentState = data?.getCurrentContent();

  return contentState.getPlainText('');
};

export const convertToDraft = (val) => {
  if (val && typeof val.getCurrentContent === 'function') {
    return val;
  }

  if (typeof val !== 'string') {
    return EditorState.createEmpty();
  }

  const html = val.trim();
  if (!html) {
    return EditorState.createEmpty();
  }

  try {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const { contentBlocks, entityMap } = contentBlock;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return EditorState.createWithContent(contentState);
    }
  } catch {
    return EditorState.createEmpty();
  }

  return EditorState.createEmpty();
};

const RichTextEditor = ({
  handleChange,
  placeholder,
  className,
  error,
  readOnly,
  value,
  defaultValue,
  textLimit,
  name,
  customClassEditor,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [checkText, setChecktext] = useState(false);

  const holder = placeholder ? placeholder : t('form.input.textField.editor.placeHolder');

  useEffect(() => {
    if (defaultValue) {
      updateOuterVal(convertToDraft(defaultValue));
    }
  }, []);

  const _handleEditorChange = (newEditorState) => {
    const contentState = newEditorState?.getCurrentContent();
    const text = contentState.getPlainText('');

    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        setChecktext(true);
      }
    }

    if (textLimit > 0) {
      if (text.length > textLimit && newEditorState.getLastChangeType() === 'split-block') {
        return;
      }

      if (text.length > textLimit && newEditorState.getLastChangeType() === 'backspace-character') {
        updateOuterVal(newEditorState);

        return;
      }

      if (text.length > textLimit) {
        const truncatedContentStateOld = truncateContent(contentState, textLimit);

        const latestData = EditorState.push(
          newEditorState,
          truncatedContentStateOld,
          'insert-characters',
        );

        updateOuterVal(EditorState.moveFocusToEnd(latestData));
        return;
      }
    }

    updateOuterVal(newEditorState);
  };

  const handleEditorChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const newText = contentState.getPlainText('');

    // Optional: Check for empty + block type (your original check)
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        setChecktext(true);
      }
    }

    if (textLimit > 0) {
      const lastChangeType = newEditorState.getLastChangeType();
      const currentLength = newText.length;

      // Allow if user is deleting text (even if over limit)
      const isDeleteAction =
        lastChangeType === 'backspace-character' ||
        lastChangeType === 'remove-range' ||
        lastChangeType === 'delete-character';

      if (isDeleteAction) {
        updateOuterVal(newEditorState);
        return;
      }

      // Fail safe, if the limit is reached do not let user add new input characters
      if (
        currentLength > textLimit &&
        (lastChangeType === 'insert-characters' || lastChangeType === 'insert-fragment')
      ) {
        return;
      }

      // Block if already at or over limit
      if (currentLength > textLimit) {
        return;
      }
    }

    // If no limit set
    updateOuterVal(newEditorState);
  };

  const handleBeforeInput = (input, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentText = currentContent.getPlainText('');

    if (textLimit > 0 && currentText.length > textLimit) {
      return 'handled'; // ❌ Block input
    }

    return 'not-handled'; // ✅ Allow input
  };

  const handlePastedText = (text, html, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const currentText = currentContent.getPlainText('');
    const totalLength = currentText.length + text.length;

    // ✅ Block paste if it exceeds character limit
    if (textLimit > 0 && totalLength > textLimit) {
      return 'handled';
    }

    // ✅ Manually insert only plain text to avoid formatting issues
    const newContent = Modifier.insertText(currentContent, editorState.getSelection(), text);

    updateOuterVal(EditorState.push(editorState, newContent, 'insert-characters'));

    return 'handled'; // Prevent default paste behavior
  };

  const updateOuterVal = (val) => {
    const event = {
      target: {
        value: val,
        name,
      },
    };

    handleChange(event);
  };

  const truncateContent = (contentState, limit) => {
    // Get plain text from content state
    const text = contentState.getPlainText('');

    // Truncate text if it exceeds the limit
    if (text.length > limit) {
      // Calculate how many characters to truncate
      const diff = text.length - limit;

      // Get the first 'limit' characters
      const truncatedText = text.substring(0, text.length - diff);

      // Create a new ContentState with truncated text
      const truncatedContentState = ContentState.createFromText(truncatedText);

      return truncatedContentState;
    }

    // Return original content state if within limit
    return contentState;
  };

  const currentContent = value?.getCurrentContent();
  const currentText = currentContent?.getPlainText('');
  const remainingCharacters = textLimit - currentText.length;

  let editorClass = classNames(classes.editorClass, customClassEditor && customClassEditor);

  return (
    <Box
      className={
        !readOnly
          ? !error
            ? `${classes.richTextEditor} ${className}`
            : `${classes.richTextEditor} ${classes.richTextEditorError} ${className}`
          : ``
      }
    >
      <Box
        className={
          checkText
            ? classNames(classes.removePlaceholder, classes.richTextBox)
            : classes.richTextBox
        }
      >
        <Editor
          editorState={value}
          onEditorStateChange={handleEditorChange}
          handleBeforeInput={handleBeforeInput}
          handlePastedText={handlePastedText}
          wrapperClassName={classes.wrapperClass}
          editorClassName={editorClass}
          toolbarClassName={classes.toolbarClass}
          toolbar={defaultOptions}
          placeholder={holder}
          readOnly={readOnly}
        />
      </Box>

      {textLimit > 0 && (
        <Box className={classes.limitText}>
          <Typography variant="body2">
            {currentText.length} / {remainingCharacters}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

RichTextEditor.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  name: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  defaultValue: PropTypes.string,
  customClassEditor: PropTypes.string,
  textLimit: PropTypes.number,
};

RichTextEditor.defaultProps = {
  className: '',
  placeholder: '',
  value: '',
  error: false,
  readOnly: false,
  defaultValue: '',
  textLimit: 0,
  customClassEditor: '',
};

export default RichTextEditor;
