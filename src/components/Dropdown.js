import React, { useState } from 'react';

const Dropdown = ({ sortData, sortBy }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = () => {
    setIsOpen(false);
  };

  return (
    <div>
        <button onClick={toggleDropdown}>
            Sort by {sortBy === 'id' ? 'ID' : 'Downloads'}
        </button>
        {isOpen && (
        <ul onClick={handleOptionClick}>
            <li onClick={() => sortData('id')}>ID</li>
            <li onClick={() => sortData('downloads')}>Downloads</li>
        </ul>
        )}
    </div>
  );
};

export default Dropdown;
