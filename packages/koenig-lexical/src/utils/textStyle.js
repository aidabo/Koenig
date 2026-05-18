import {Color} from '@tryghost/color-utils';

export function setStyleProperty(styleString, property, value) {
    const element = document.createElement('span');
    element.style.cssText = styleString || '';

    if (value) {
        element.style.setProperty(property, value);
    } else {
        element.style.removeProperty(property);
    }

    return element.getAttribute('style') || '';
}

export function getStyleProperty(styleString = '', property) {
    const element = document.createElement('span');
    element.style.cssText = styleString || '';
    return element.style.getPropertyValue(property) || '';
}

export function normalizeColorValue(value = '') {
    if (!value) {
        return '';
    }

    try {
        return Color(value).hex();
    } catch (error) {
        return value;
    }
}
