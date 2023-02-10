import { useState } from 'react'
import { UseFormRegisterReturn } from 'react-hook-form'
import clsx from 'clsx'
import parse from 'html-react-parser'

export type CheckboxProps = {
    label: string
    name: string
    checked?: boolean
    showSwitch?: boolean
    onChange?: (checked: boolean) => void
    error?: string
    register?: UseFormRegisterReturn
}

export default function Checkbox({
    label,
    name,
    checked = false,
    onChange,
    showSwitch = true,
    error = '',
    register
}: CheckboxProps) {
    const [internal, setInternal] = useState(checked)

    const blockClasses = clsx({
        'input-block': true,
        'input-block--error': error !== ''
    })

    const classes = clsx({
        'toggle-switch': showSwitch
    })

    const handleChange = () => {
        onChange(!internal)
        setInternal(!internal)
    }

    return (
        <div className={blockClasses}>
            <input
                type="checkbox"
                name={name}
                id={name}
                checked={register ? undefined : internal}
                className={classes}
                onChange={() => handleChange()}
                {...register}
            />
            <label htmlFor={name}>{parse(label)}</label>
            {error !== '' && <span>{error}</span>}
        </div>
    )
}
