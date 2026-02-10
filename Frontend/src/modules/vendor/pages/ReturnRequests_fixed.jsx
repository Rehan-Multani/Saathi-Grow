// This is just the onClick section that needs to be replaced in ReturnRequests.jsx
// Replace lines 222-245 with:

onClick = {(e) => {
    e.stopPropagation();
    setActiveActionId(activeActionId === request.id ? null : request.id);
}}
