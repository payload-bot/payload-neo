const helper = {
    player: {
        _: "#form1 > div.col-sm-10.col-sm-offset-1",
        verified: "#timeline i.fa-check-circle",
        name: "#ContentPlaceHolder1_Main_lblPlayerName",
        probation: "#ContentPlaceHolder1_Main_divProbation",
        isAccount: "#ContentPlaceHolder1_Main_hMessage",
        avatar: "#ContentPlaceHolder1_Main_imgProfileImage",
        banned: "span.glyphicon.glyphicon-ok",
        totalEarnings: "#ContentPlaceHolder1_Main_lblTotalEarnings",
        trophies: "#ContentPlaceHolder1_Main_lblTrophies",
        leagueHeading: "h3 span[id*='lblLeagueName']",
        leagueTable: {
            _: ".table.table-striped",
            season: ".table.table-striped tbody tr td:nth-child(1) a",
            div: ".table.table-striped tbody tr td:nth-child(2) a",
            team: ".table.table-striped tbody tr td:nth-child(3) a",
            endRank: ".table.table-striped tbody tr td:nth-child(4)",
            recordWith: ".table.table-striped tbody tr td:nth-child(5)",
            recordWithout: ".table.table-striped tbody tr td:nth-child(6)",
            amountWon: ".table.table-striped tbody tr td:nth-child(7) strong",
            joined: ".table.table-striped tbody tr td:nth-child(8)",
            left: ".table.table-striped tbody tr td:nth-child(9)"
        }
    }
};

export default helper