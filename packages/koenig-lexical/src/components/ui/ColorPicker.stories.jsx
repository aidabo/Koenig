import React from 'react';
import {ColorPicker} from './ColorPicker';
import {getColorPickerSwatches} from './colorSwatches';

const story = {
    title: 'Generic/Color picker',
    component: ColorPicker,
    parameters: {
        status: {
            type: 'uiReady'
        }
    },
    argTypes: {
        selectedName: {control: 'select', options: ['grey', 'blue', 'green', 'yellow', 'red', 'pink', 'purple']}
    }
};
export default story;

const Template = (args) => {
    return (
        <div className="w-[240px]">
            <ColorPicker {...args} />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    swatches: getColorPickerSwatches()
};
