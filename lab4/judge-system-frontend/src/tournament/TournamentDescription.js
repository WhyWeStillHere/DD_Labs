import { TournamentTools } from '../redux/TournamentReducer'
import { Col, Row } from 'react-bootstrap'
import { convertFromRaw, Editor, EditorState } from 'draft-js'
import React from 'react'
import { tryAndReturn } from '../tools/try'
import RichEditor from '../editor/RichEditor'

export function TournamentDescription({ tournamentObjectFromDB }) {
    return (
        <Col>
            {Object.entries(tournamentObjectFromDB)
                .filter(([key, value]) => {
                    return (
                        TournamentTools.mapKeyWithType(key) !==
                        TournamentTools.types.unknown
                    )
                })
                .map(([key, value], id) => {
                    const type = TournamentTools.mapKeyWithType(key)
                    let main = ''
                    let extra = null
                    if (type === TournamentTools.types.text) {
                        main = value
                    }
                    if (type === TournamentTools.types.dropdown) {
                        const valueObject = tryAndReturn(() =>
                            JSON.parse(value)
                        )
                        if (valueObject?.isEditor === false) {
                            main = valueObject?.value
                        } else {
                            const editorState = tryAndReturn(() =>
                                EditorState.createWithContent(
                                    convertFromRaw(valueObject?.value?.real)
                                )
                            )
                            main = editorState && (
                                <RichEditor
                                    readOnly={true}
                                    state={editorState}
                                />
                            )
                        }
                    }
                    if (type === TournamentTools.types.simpleDropdown) {
                        main = TournamentTools.mapDropdownRealValueWithVisibleValue(
                            key,
                            value
                        )
                    }
                    return (
                        <Row noGutters key={id} className='mb-2'>
                            <b className='mr-2'>{key}:</b>
                            {main}
                        </Row>
                    )
                })}
        </Col>
    )
}
