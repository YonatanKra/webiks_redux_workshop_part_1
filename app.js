// store creator
function createStore(reducer, initState) {
    var state = initState;

    var listeners = [];

    function getState() {
        return state;
    }

    function dispatch(action) {
        state = reducer(state, action);
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](state, action);
        }
    }

    // TODO::make listeners better by allowing to listen to certain objects and or action?
    function subscribe(cb) {
        listeners.push(cb);
    }

    return {
        getState: getState,
        dispatch: dispatch,
        subscribe: subscribe
    };
}

// now the app - it would create a list of items and present them on client
// our initial state
var initState = {
    list: [],
    selected: undefined
};

// reducer
function listReducer(state, action) {
    // immutability!!!
    state = JSON.parse(JSON.stringify(state)); // simple naive clone... better to use lodash :)
    switch (action.type) {
        case "ADD":
            state.list.push(action.payload);
            break;
        case "DELETE_BY_INDEX":
            state.list.splice(action.payload, 1);
            if (action.payload === state.selected){
                state.selected = undefined;
            }
            break;
        case "SELECT":
            state.selected = action.payload;
            break;
        case "RESET":
            state.list = [];
    }

    return state;
}

// since we have no angular/react, we do it "manually" with jQuery...
function listViewHandler(state) {
    if (typeof $ === 'undefined') {
        return;
    }
    var listHtml = '';
    for (var i = 0; i < state.list.length; i++) {
        listHtml += '<li onclick="selectItem()" data-index="' + i + '" class="list-item">' + state.list[i] + '</li>';
    }
    $('#list').html(listHtml);
}

function addItemButton() {
    var payload = $('#list-item-input').val();
    if (payload === '') {
        return;
    }

    myStore.dispatch({
        type: "ADD",
        payload: payload
    });
}

function deleteItemButton() {
    if (typeof myStore.getState().selected === 'undefined') {
        return;
    }

    myStore.dispatch({
        type: "DELETE_BY_INDEX",
        payload: myStore.getState().selected
    });
}

function selectItem() {
    myStore.dispatch({
        type: "SELECT",
        payload: event.target.dataset.index
    });
}

// create our store
var myStore = createStore(listReducer, initState);

myStore.subscribe(function (state, action) {
    console.log("Subscriber activated and got: ", state);
    listViewHandler(state);

    // handle a change in selection
    $('li.list-item').removeClass('selected');
    $($('#list').children()[myStore.getState().selected]).addClass('selected');
});

// now use the store

// make it more interesting...
asyncDispatch = function asyncDispatch(action, delay) {
    if (!delay) {
        delay = 1000;
    }
    setTimeout(function () {
        myStore.dispatch(action);
    }, delay);

};

asyncDispatch({
    type: "ADD",
    payload: "List item one"
});

console.log("Got state: ", myStore.getState().list);

asyncDispatch({
    type: "DELETE_BY_INDEX",
    payload: 0
}, 3000);

console.log("Got state: ", myStore.getState().list);