import React from 'react';
import { storiesOf } from '@storybook/react';
import { Select } from 'components';
import { text, boolean } from '@storybook/addon-knobs';

const OPTIONS = [
  { label: 'Value 1', value: '1' },
  { label: 'Value 2', value: '2' },
];

storiesOf('Basic', module).add('Select', () => {
  const label = text('label', 'Label');
  const placeholder = text('placeholder', 'Введите значение');
  const error = text('error text', '');
  const disabled = boolean('disabled', false);

  return (
    <div style={{ width: 300 }}>
      <Select
        name="test"
        color="dark"
        options={OPTIONS}
        label={label}
        error={error}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
});
