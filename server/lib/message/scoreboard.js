var match = function(
    homeTeam, // team name
    homeScore, // score
    awayTeam, // team name
    awayScore, // score
    beginTime, // begin time match
    endTime, // end time match
    countDown, // clock time in seconds
    running, // match still in progress?
) {
    return {
        homeTeam : homeTeam,
        homeScore : homeScore,
        awayTeam : awayScore,
        awayScore : awayScore,
        beginTime : beginTime,
        endTime : endTime,
        countDown : countDown
        running : running
    };
}
match.type = 'match-update';
exports.match = match;