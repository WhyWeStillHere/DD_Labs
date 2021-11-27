import {Button, Container, Form, Modal, Row} from 'react-bootstrap'
import JudgesList from './judges_list/JudgesList'
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {createAddJudge, createDeleteJudge, createGetRoles} from "../redux/actions";
import {useParams} from "react-router-dom";
import {ORGANISER_ACCESS, TOURNAMENT_JUDGE_CODE} from "./TournamentAccessRights";

export default function JudgingPage({accessRights}) {
    const { i } = useParams()
    const dispatch = useDispatch()
    const roles = useSelector((state) => state.tournament.roles)

    useEffect(() => {
        dispatch(createGetRoles({ tournamentId: i }))
    }, [i, dispatch])

    const getJudges = (roles) => {
        return roles.filter((role) => { return role["Status"] === TOURNAMENT_JUDGE_CODE })
    }

    return (
        <div>
            <JudgesList judges={getJudges(roles)} />
            {accessRights === ORGANISER_ACCESS &&
                <JudgeAddDeleteComponent tournamentId={i}/>}
        </div>
    )
}

function JudgeAddDeleteComponent({tournamentId}) {
    const dispatch = useDispatch()

    let initialField = ''
    let [field, setField] = useState(initialField)

    function updateField(event) {
        setField(event.target.value)
    }

    function addJudge() {
        dispatch(createAddJudge({tournamentId: tournamentId, JudgeName: field}))
    }

    function removeJudge() {
        dispatch(createDeleteJudge({tournamentId: tournamentId, JudgeName: field}))
    }

    return (
    <Container>
        <Form className="openBillForm">
            <label>
                Введите имя пользователя для удаления/добавления в список судей:

            </label>
            <input
                value={field}
                onChange={(event) => updateField(event)}
                placeholder="Username"
                required
            />
        </Form>
        <Button variant="outline-success" onClick={addJudge}>
            Add Judge
        </Button>
        <Button variant="outline-danger" onClick={removeJudge}>
            Remove Judge
        </Button>
    </Container>
    )
}