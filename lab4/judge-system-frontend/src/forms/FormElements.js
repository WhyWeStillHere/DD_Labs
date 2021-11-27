import { useField } from 'formik'
import {
    Button,
    Col,
    Dropdown,
    Form,
    Image,
    InputGroup,
    Row,
} from 'react-bootstrap'
import React, { useEffect, useRef, useState } from 'react'

import './calendar.css'
import './inputMoment.css'
import './searchUser.css'
import CalendarSVG from './calendar.svg'
import SearchUserSVG from './searchUser.svg'
import { InputMoment } from 'react-input-moment'
import moment from 'moment'

import {
    ContentState,
    convertFromRaw,
    convertToRaw,
    EditorState,
} from 'draft-js'
import RichEditor from '../editor/RichEditor'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { tryAndReturn } from '../tools/try'

export function TextInput({ label, ...props }) {
    const [field, meta] = useField(props)

    return (
        <Form.Group controlId={label}>
            <InputGroup hasValidation={true}>
                <InputGroup.Prepend>
                    <InputGroup.Text id={label}>{label}</InputGroup.Text>
                </InputGroup.Prepend>

                <Form.Control
                    {...field}
                    aria-describedby={label}
                    type='text'
                    {...props}
                    isValid={!meta.error}
                    isInvalid={meta.touched && !!meta.error}
                    style={{ boxShadow: 'none' }}
                />
                <Form.Control.Feedback type='invalid'>
                    {meta.error}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
}

export function DateTimeInput({ label, ...props }) {
    const [field, meta, helpers] = useField(props)

    const { setValue } = helpers
    const { value } = meta

    const [show, setShow] = useState(false)

    return (
        <Form.Group controlId={label}>
            <InputGroup hasValidation={true}>
                <InputGroup.Prepend onClick={() => setShow(!show)}>
                    <InputGroup.Text
                        className='calendarIMGContainer'
                        id={label}
                    >
                        {label}
                        <Image
                            src={CalendarSVG}
                            className='calendarIMG ml-3'
                            style={{ height: '1em', marginBottom: '0.1em' }}
                        />
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    {...field}
                    aria-describedby={label}
                    type='text'
                    {...props}
                    isValid={!meta.error}
                    isInvalid={meta.touched && !!meta.error && !show}
                    readOnly
                    style={{ boxShadow: 'none' }}
                    className='clickable'
                    onClick={() => setShow(!show)}
                />
                <Form.Control.Feedback type='invalid'>
                    {meta.error}
                </Form.Control.Feedback>
            </InputGroup>
            {show && (
                <Col style={{ overflowX: 'auto' }}>
                    <Row className='mt-2' style={{ minWidth: '400px' }}>
                        <InputMoment
                            moment={value === '' ? moment() : moment(value)}
                            // locale={locale}
                            showSeconds={false}
                            onChange={(moment) => {
                                setValue(moment.format('YYYY-MM-DD HH:mm'))
                            }}
                        />
                    </Row>
                </Col>
            )}
        </Form.Group>
    )
}

export function DropdownInput({ label, items, textItems, ...props }) {
    const [field, meta, helpers] = useField(props)

    const { setValue } = helpers
    const { value } = meta

    const [show, setShow] = useState([false, false])

    const getVisibleValue = () => {
        if (textItems === undefined) {
            const item = Object.entries(items).find(
                ([buttonText, { realValue, visibleValue }]) =>
                    realValue === value
            )
            return item ? item[1]['visibleValue'] : ''
        }

        const parsedValue = tryAndReturn(() => JSON.parse(value))
        if (!parsedValue) {
            return ''
        }

        if (parsedValue['isEditor'] === false) {
            const item = Object.entries(items).find(
                ([buttonText, { realValue, visibleValue }]) =>
                    realValue === parsedValue['value']
            )
            return item ? item[1]['visibleValue'] : ''
        }

        if (parsedValue['isEditor'] === true) {
            setShow([true, false])
            return parsedValue['value']['visible']
        }

        return ''
    }

    const [visibleValue, setVisibleValue] = useState(() => getVisibleValue())

    const editorRef = useRef(null)

    return (
        <Form.Group controlId={label}>
            <InputGroup hasValidation={true}>
                <Dropdown as={InputGroup.Prepend}>
                    <Dropdown.Toggle
                        variant='outline-secondary'
                        id='dropdown-basic-button'
                        style={{ boxShadow: 'none' }}
                    >
                        {' '}
                        {label}{' '}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {Object.entries(items).map(
                            ([buttonText, { realValue, visibleValue }]) => (
                                <Dropdown.Item
                                    key={realValue}
                                    onClick={() => {
                                        setValue(
                                            textItems !== undefined
                                                ? JSON.stringify({
                                                      isEditor: false,
                                                      value: realValue,
                                                  })
                                                : realValue
                                        )
                                        setVisibleValue(visibleValue)
                                        setShow([false, false])
                                    }}
                                >
                                    {buttonText}
                                </Dropdown.Item>
                            )
                        )}
                        {textItems !== undefined &&
                            Object.entries(textItems).map(
                                ([buttonText, { realValue, visibleValue }]) => (
                                    <Dropdown.Item
                                        key={buttonText}
                                        onClick={() => {
                                            const value =
                                                realValue['isSimpleText'] ===
                                                true
                                                    ? convertToRaw(
                                                          ContentState.createFromText(
                                                              realValue['state']
                                                          )
                                                      )
                                                    : realValue['state']

                                            setValue(
                                                JSON.stringify({
                                                    isEditor: true,
                                                    value: {
                                                        real: value,
                                                        visible: visibleValue,
                                                    },
                                                })
                                            )
                                            setVisibleValue(visibleValue)
                                            setShow([true, true])
                                        }}
                                    >
                                        {buttonText}
                                    </Dropdown.Item>
                                )
                            )}
                    </Dropdown.Menu>
                </Dropdown>
                <Form.Control
                    aria-describedby={label}
                    {...field}
                    value={visibleValue}
                    type='text'
                    {...props}
                    isValid={!meta.error}
                    isInvalid={meta.touched && !!meta.error}
                    readOnly
                    style={{ boxShadow: 'none' }}
                    className='nonClickable'
                    onClick={() => setShow([show[0], !show[1]])}
                />

                <Form.Control.Feedback type='invalid'>
                    {meta.error}
                </Form.Control.Feedback>
            </InputGroup>
            {show[0] && show[1] && (
                <>
                    <div className='mt-2'>
                        <RichEditor
                            ref={editorRef}
                            state={EditorState.createWithContent(
                                convertFromRaw(
                                    JSON.parse(value)['value']['real']
                                )
                            )}
                        />
                    </div>
                    <Row noGutters className='justify-content-end'>
                        <Button
                            variant='outline-secondary'
                            className='mt-2 shadow-none'
                            onClick={() => {
                                setValue(
                                    JSON.stringify({
                                        isEditor: true,
                                        value: {
                                            real: convertToRaw(
                                                editorRef.current
                                                    .getState()
                                                    .getCurrentContent()
                                            ),
                                            visible: visibleValue,
                                        },
                                    })
                                )
                                // console.log(
                                //     JSON.stringify({
                                //         isEditor: true,
                                //         value: {
                                //             real: convertToRaw(
                                //                 editorRef.current
                                //                     .getState()
                                //                     .getCurrentContent()
                                //             ),
                                //             visible: visibleValue,
                                //         },
                                //     })
                                // )
                                setShow([show[0], !show[1]])
                            }}
                        >
                            Сохранить
                        </Button>
                    </Row>
                </>
            )}
        </Form.Group>
    )
}

export function DateInput({ label, ...props }) {
    const [field, meta, helpers] = useField(props)

    const { setValue } = helpers

    const [show, setShow] = useState(false)

    return (
        <Form.Group controlId={label}>
            <InputGroup>
                <InputGroup.Prepend onClick={() => setShow(!show)}>
                    <InputGroup.Text
                        className='calendarIMGContainer'
                        id={label}
                    >
                        {label}
                        <Image
                            src={CalendarSVG}
                            className='calendarIMG ml-3'
                            style={{ height: '1em', marginBottom: '0.1em' }}
                        />
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    {...field}
                    aria-describedby={label}
                    type='text'
                    {...props}
                    isValid={!meta.error}
                    isInvalid={meta.touched && !!meta.error && !show}
                    readOnly
                    style={{ boxShadow: 'none' }}
                    className='clickable'
                    onClick={() => setShow(!show)}
                />
                <Form.Control.Feedback type='invalid'>
                    {meta.error}
                </Form.Control.Feedback>
            </InputGroup>
            {show && (
                <Col style={{ overflowX: 'auto' }}>
                    <Row className='mt-2'>
                        <Calendar
                            onClickDay={(date) => {
                                setValue(moment(date).format('YYYY-MM-DD'))
                                setShow(false)
                            }}
                            value={new Date()}
                            calendarType='ISO 8601'
                            defaultView='year'
                            minDetail='decade'
                        />
                    </Row>
                </Col>
            )}
        </Form.Group>
    )
}

export function TextField({ label, value }) {
    return (
        <Form.Group controlId={label}>
            <InputGroup hasValidation={true}>
                <InputGroup.Prepend>
                    <InputGroup.Text id={label}>{label}</InputGroup.Text>
                </InputGroup.Prepend>

                <Form.Control
                    value={value}
                    aria-describedby={label}
                    type='text'
                    style={{ boxShadow: 'none' }}
                    readOnly
                />
            </InputGroup>
        </Form.Group>
    )
}

export function SearchInput({
    description,
    onSearch = () => {},
    onChange = () => {},
    value,
}) {
    // const [inputValue, setInputValue] = useState(value ? value : '')
    // useEffect(() => {
    //     if (value !== undefined) {
    //         setInputValue(value)
    //     }
    // }, [value])
    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSearch(value)
        }
    }
    const onChangeInternal = (event) => {
        // setInputValue(event.target.value)
        onChange(event.target.value)
    }
    return (
        <>
            {/*<Form>*/}
            {/*    <Form.Group controlId={description}>*/}
            <InputGroup className='searchIMGContainer'>
                <InputGroup.Prepend>
                    <InputGroup.Text>
                        <Image
                            src={SearchUserSVG}
                            className='searchIMG'
                            style={{ height: '1.5em' }}
                        />
                    </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    placeholder={description}
                    aria-describedby={description}
                    type='text'
                    value={value ? value : ''}
                    style={{ boxShadow: 'none' }}
                    onKeyDown={onKeyDown}
                    onChange={onChangeInternal}
                />
                <Form.Control.Feedback>abc</Form.Control.Feedback>
            </InputGroup>
            {/*{show && (*/}
            {/*    <Col style={{ overflowX: 'auto' }}>*/}
            {/*        <Row className='mt-2'>*/}
            {/*            <Calendar*/}
            {/*                onClickDay={(date) => {*/}
            {/*                    setValue(moment(date).format('YYYY-MM-DD'))*/}
            {/*                    setShow(false)*/}
            {/*                }}*/}
            {/*                value={new Date()}*/}
            {/*                calendarType='ISO 8601'*/}
            {/*                defaultView='year'*/}
            {/*                minDetail='decade'*/}
            {/*            />*/}
            {/*        </Row>*/}
            {/*    </Col>*/}
            {/*)}*/}

            {/*    </Form.Group>*/}
            {/*   */}
            {/*</Form>*/}
        </>
    )
}
