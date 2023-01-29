import React from 'react';

function Dialog(props) {

  return (
    <dialog id="dialog" open>
      <header>What to sort the mods by?</header>
      <form method="dialog">
        <menu>
        <button value="name" onClick={() => props.handleSort("Id")}>Id</button>
          <button value="downloads" onClick={() => props.handleSort("Downloads")}>Downloads</button>
        </menu>
      </form>
    </dialog>
  );
}

export default Dialog;
