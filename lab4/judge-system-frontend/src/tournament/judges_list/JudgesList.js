import { Button, Col, Container } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'

import paginationFactory from 'react-bootstrap-table2-paginator'
import Caption from "../../caption/Caption";
import React from "react";

export default function JudgesList({ judges }) {

    const judges_data = judges.map((judge) => ({
        username: judge['UserInfo']['Username'],
        id: judge['id'],
        lastName: judge['UserInfo']['SecondName'],
        firstName: judge['UserInfo']['FirstName'],
    }))

    const columns = [
        {
            dataField: 'id',
            hidden: true,
        },
        {
            dataField: 'username',
            text: 'Username',
            sort: true,
            headerStyle: { width: '30%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
            class: '',
        },
        {
            dataField: 'firstName',
            text: 'Имя',
            sort: true,
            headerStyle: { width: '30%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
        },
        {
            dataField: 'lastName',
            text: 'Фамилия',
            sort: true,
            headerStyle: { width: '30%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
        },
    ]

    const defaultSorted = [
        {
            dataField: 'username',
            order: 'asc',
        },
    ]

    const noJudgesIndication = () => {
        return <Container className="text-center"> А судьи кто? </Container>
    }

    const pageListRenderer = ({ pages, onPageChange }) => {
        const pageWithoutIndication = pages.filter(
            (p) => typeof p.page !== 'string'
        )
        return pages.length > 1 ? (
            <Col className="d-flex justify-content-end">
                {pages.map((p, i) => {
                    if (pageWithoutIndication.includes(p)) {
                        return (
                            <Button
                                key={i}
                                className="shadow-none mr-1 border"
                                style={{ borderRadius: '2px' }}
                                variant={p.active ? 'dark' : ''}
                                onClick={() => onPageChange(p.page)}
                            >
                                {p.page}
                            </Button>
                        )
                    }

                    return (
                        <Button
                            key={i}
                            className="shadow-none mr-1"
                            variant="outline-dark"
                            onClick={() => onPageChange(p.page)}
                        >
                            {p.page}
                        </Button>
                    )
                })}
            </Col>
        ) : (
            <></>
        )
    }

    const options = {
        pageListRenderer: pageListRenderer,
        hideSizePerPage: true,
    }

    return (
        <Container className="float-center overflow-auto d-flex flex-column">
            <Caption text={'Список судей'} />
            <BootstrapTable
                striped
                keyField="id"
                data={judges_data}
                columns={columns}
                noDataIndication={noJudgesIndication}
                defaultSorted={defaultSorted}
                pagination={paginationFactory(options)}
            />
        </Container>
    )
}
