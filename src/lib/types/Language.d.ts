export type Language = {
    parseargs_fail_argsmissing: string,
    parseargs_fail_numberarg: string,
    parseargs_fail_lessthan: string,
    parseargs_fail_greaterthan: string,
    parseargs_fail_notaccepted: string,
    parseargs_fail_argless: string,
    parseargs_fail_argmore: string,
    parseargs_fail_boolean: string,

    eightball_noquestion: string,
    eightball_answer: string,

    bruh_nouser: string,
    bruh_user: string,

    changelog_invalid: string,
    changelog_reply: string,

    choose_reply: string,

    combine_fail_invalid: string,
    combine_fail_invalidlog: string,
    combine_fail_noapikey: string,
    combine_fail_error: string,
    combine_success: string,

    commands_embedtitle: string,
    commands_embedfooter: string,
    commands_commands: string,
    commands_autoresponses: string,

    config_error_invalidsyntax: string,
    config_error_invalidsubcommand: string,
    config_error_noargs: string,
    config_success_setkey: string,
    config_success_setnotif: string,

    findping_fail_noping: string,

    face_fail_noimg: string,
    face_fail_novalidface: string,
    face_error: string,

    help_embedusage: string,
    help_embedpermissionshead: string,
    help_embedpermissionsbody: string,
    help_embedsubcmds: string,
    help_embedfooter: string,

    info_embedtitle: string,
    info_embedbody: string,
    info_embedfooter: string,

    language_fail_invalidsub: string,
    language_default: string,
    language_delete_success: string,
    language_delete_embedfooter: string,
    language_set_fail_oldnew: string,
    language_set_fail_nonew: string,
    language_set_success_embeddesc: string,
    language_set_success_embedtitle: string,

    link_fail_invalidid: string,
    link_success: string,

    log_fail_noid: string,
    log_fail_nologhistory: string,

    prefix_fail_invalidsub: string,
    prefix_default: string,
    prefix_delete_success: string,
    prefix_delete_embedfooter: string,
    prefix_set_fail_oldnew: string,
    prefix_set_fail_nonew: string,
    prefix_set_success_embeddesc: string,
    prefix_set_success_embedtitle: string,

    profile_points: string,

    purge_success: string,

    pushcart_fail_nosubcmd: string,
    pushcart_fail_cooldown: string,
    pushcart_fail_maxpoints: string,
    pushcart_fail_notarget: string,
    pushcart_fail_toomanypoints: string,
    pushcart_fail_noleaderboard: string,
    pushcart_userembedtitle: string,
    pushcart_userembedfooter: string,
    pushcart_serverembedtitle: string,
    pushcart_giftsuccess: string,
    pushcart_success: string,

    restrict_fail_deny: string,
    restrict_success: string,
    unrestrict_success: string,

    restrict_allcmnds: string,
    restrict_allchns: string,
    restrict_none: string,

    rgl_fail_noid: string,
    rgl_embedtitle: string,
    rgl_embeddesc_steamid: string,
    rgl_embeddesc_error: string,
    rgl_embeddesc_name: string,
    rgl_embeddesc_banned: string,
    rgl_embeddesc_probation: string,
    rgl_embeddesc_verified: string,
    rgl_embeddesc_earnings: string,

    rtd_roll: string,

    settings_fail_nosubcmd: string,
    settings_all: string,
    settings_admin: string,

    dashboard_admin: string,
    dashboard_mod: string,

    server_invalidsyntax: string,
    server_invalidcmd: string,
    server_nocommand: string,
    server_noname: string,
    server_noservers: string,
    server_targetinvalid: string,
    server_errorconnecting: string,
    server_errorsending: string,
    server_embedtitle: string,
    server_embeddesc: string,
    server_removeserver: string,
    server_setserver: string,

    snipe_fail_nomsg: string,
    snipe_fail_max: string,

    translate_error: string,
    translate_embedtitle: string,
    translate_embeddesc: string,
    translate_embedfooter: string,

    servers_offline: string,
    servers_players: string
}

export default Language