import React from 'react'
import { Switch, Route, useRouteMatch } from 'react-router-dom'
import { Tournament } from './Tournament'
import CreateOrEditTournament from './CreateOrEditTournament'

export function TournamentsArea() {
    let match = useRouteMatch()
    return (
        <Switch>
            <Route path={`${match.path}/create`}>
                <CreateOrEditTournament tournamentId={-1} />
            </Route>

            <Route path={`${match.path}/:i`}>
                <Tournament />
            </Route>
        </Switch>
    )
}
