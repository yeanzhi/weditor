/**
 * Created by yeanzhi on 17/7/20.
 */
'use strict';
import './index.scss';
import React, {Component} from 'react';
import classnames from 'classnames';

import {getEditor} from '../../lib/quillEditor'
import editor from '../../model/editor';
import Icon from '../icon';

export default class BubbleToolbar extends Component {
    state = {
        show: true,
        left: 0,
        top: 0,
        marginTop: 0,
        display: 'block',
        bubbleOpacity: false
    };

    componentDidMount() {
        if (getEditor()) {
            getEditor().on('selection-change', this.onSelectionChange)
        }
    }

    componentWillUnmount() {
        getEditor().off('selection-change', this.onSelectionChange);
        this.clearTransition();
    }

    onSelectionChange = (range) => {
        if (range && range.length) {
            let {left, top, height, width} = getEditor().getBounds(range.index + Math.floor(range.length / 2));
            this.setState({
                show: true,
                left: left - 105,//105 is bubble width/2
                top,
                marginTop: -(height + 20),
                display: 'block',
                bubbleOpacity: true
            });
            this.transition();
        } else {
            this.setState({
                display: 'none'
            });
            this.clearTransition();
        }
    };

    clearTransition = () => {
        clearTimeout(this.timer);
        clearTimeout(this.bubbleOpacityTimer);
    };

    transition = () => {
        this.clearTransition();
        this.timer = setTimeout(() => {
            this.setState({
                display: 'none'
            });
        }, 4100);
        this.bubbleOpacityTimer = setTimeout(() => {
            this.setState({
                bubbleOpacity: false
            });
        }, 1000);
    };

    hasMark = (type) => {
        return editor.format[type]
    };

    hasBlock = (type, val) => {
        if (val) {
            return editor.format[type] === val;
        } else {
            return editor.format[type]
        }
    };

    renderMarkButton = (type, icon) => {
        const isActive = this.hasMark(type);
        const onMouseDown = e => this.onClickMark(e, type);
        const classname = classnames({
            button: true,
            active: isActive
        })
        return (
            <button className={classname} onMouseDown={onMouseDown}>
                <Icon type={icon}/>
            </button>
        )
    };

    renderBlockButton = (type, icon, val) => {
        const isActive = this.hasBlock(type, val)
        const onMouseDown = e => this.onClickBlock(e, type, val);
        const classname = classnames({
            button: true,
            active: isActive
        })
        return (
            <button className={classname} onMouseDown={onMouseDown}>
                <Icon type={icon}/>
            </button>
        )
    };

    onClickMark = (e, type) => {
        e.preventDefault();
        const quillEditor = getEditor();
        if (quillEditor) {
            if (this.hasMark(type)) {
                quillEditor.format(type, false, 'user');
            } else {
                quillEditor.format(type, true, 'user');
            }
        }
    };

    onClickBlock = (e, type, val) => {
        e.preventDefault();
        const quillEditor = getEditor();
        if (quillEditor) {
            if (this.hasBlock(type)) {
                if (editor.format[type] === val) {
                    quillEditor.format(type, false, 'user');
                } else {
                    quillEditor.format(type, val, 'user');
                }
            } else {
                if (val) {
                    quillEditor.format(type, val, 'user');
                } else {
                    quillEditor.format(type, true, 'user');
                }
            }

        }
    };

    renderLinkBtn = () => {
        const isActive = this.hasMark('link');
        const onMouseDown = e => {
            if (getEditor()) {
                let toolbar = getEditor().getModule('toolbar');
                toolbar.handlers['link'].call(toolbar, !editor.format['link']);
            }
        };
        const classname = classnames({
            button: true,
            active: isActive
        });
        return (
            <button className={classname} onMouseDown={onMouseDown}>
                <Icon type="link"/>
            </button>
        )
    };

    render() {
        let classname = classnames({
            'weditor-bubble-toolbar': true,
            'bubble-opacity': this.state.bubbleOpacity
        })
        return (
            <div className={classname} style={this.state}>
                <span className="weditor-tooltip-arrow"/>
                <div className="weditor-bubble-toolbar-inner">
                    {this.renderMarkButton('bold', 'bold')}
                    {this.renderMarkButton('italic', 'italic')}
                    {this.renderLinkBtn()}
                    <Icon type="vertical"/>
                    {this.renderBlockButton('header', 'h1', 1)}
                    {this.renderBlockButton('header', 'h2', 2)}
                    {this.renderBlockButton('header', 'h3', 3)}
                </div>
            </div>
        )
    }
}
