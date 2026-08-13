package net.jqube.server.enums;

public enum QubeAuthorities {

    // Qube
    VIEW_QUBE,
    UPDATE_QUBE,
    DELETE_QUBE,
    ARCHIVE_QUBE,

    // Members
    VIEW_MEMBERS,
    INVITE_MEMBER,
    REMOVE_MEMBER,
    CHANGE_MEMBER_ROLE,

    // Repository
    VIEW_REPOSITORY,
    SYNC_REPOSITORY,

    // Scans
    START_SCAN,
    CANCEL_SCAN,
    VIEW_SCANS,

    // Findings
    VIEW_FINDINGS,
    CHANGE_FINDING_STATUS,

    // AI
    GENERATE_REMEDIATION,
    CREATE_PULL_REQUEST,

    // Webhooks
    MANAGE_WEBHOOKS,

    // Settings
    MANAGE_SETTINGS

}