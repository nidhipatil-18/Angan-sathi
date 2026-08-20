const getStartedBtn = document.getElementById("getStartedBtn");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const addChildBtn = document.getElementById("addChildBtn");
const archivedChildrenBtn = document.getElementById("archivedChildrenBtn");
const backDashboardBtn = document.getElementById("backDashboardBtn");
const cancelChildBtn = document.getElementById("cancelChildBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const childForm = document.getElementById("childForm");
const editChildForm = document.getElementById("editChildForm");
const editDetailsBtn = document.getElementById("editDetailsBtn");

const childrenTable = document.getElementById("childrenTable");
const totalChildren = document.getElementById("totalChildren");
const totalBoys = document.getElementById("totalBoys");
const totalGirls = document.getElementById("totalGirls");
const selectedGroup = document.getElementById("selectedGroup");
const ageCards = document.querySelectorAll(".age-card");
const searchChild = document.getElementById("searchChild");
const genderFilter = document.getElementById("genderFilter");

const archivedChildrenTable =
    document.getElementById("archivedChildrenTable");

const archivedSearch =
    document.getElementById("archivedSearch");

let children = [];
let selectedAgeGroup = null;

function parseDate(dateString) {
    const dateOnly = String(dateString).substring(0, 10);
    const parts = dateOnly.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}

function formatDate(dateString) {
    const dateOnly = String(dateString).substring(0, 10);
    const parts = dateOnly.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

function calculateAge(dob) {
    const birthDate = parseDate(dob);
    const today = new Date();

    let years =
        today.getFullYear() -
        birthDate.getFullYear();

    let months =
        today.getMonth() -
        birthDate.getMonth();

    let days =
        today.getDate() -
        birthDate.getDate();

    if (days < 0) {
        months--;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return {
        years: years,
        months: months
    };
}

function getAgeGroup(dob) {
    const birthDate = parseDate(dob);
    const today = new Date();

    const sixMonthsDate = new Date(
        birthDate.getFullYear(),
        birthDate.getMonth() + 6,
        birthDate.getDate()
    );

    const oneYearDate = new Date(
        birthDate.getFullYear() + 1,
        birthDate.getMonth(),
        birthDate.getDate()
    );

    const twoYearDate = new Date(
        birthDate.getFullYear() + 2,
        birthDate.getMonth(),
        birthDate.getDate()
    );

    const threeYearDate = new Date(
        birthDate.getFullYear() + 3,
        birthDate.getMonth(),
        birthDate.getDate()
    );

    const fiveYearDate = new Date(
        birthDate.getFullYear() + 5,
        birthDate.getMonth(),
        birthDate.getDate()
    );

    const sixYearDate = new Date(
        birthDate.getFullYear() + 6,
        birthDate.getMonth(),
        birthDate.getDate()
    );

    if (today < sixMonthsDate) {
        return "0-6-months";
    }

    if (today < oneYearDate) {
        return "6-months-1-year";
    }

    if (today < twoYearDate) {
        return "1-2-years";
    }

    if (today < threeYearDate) {
        return "2-3-years";
    }

    if (today < fiveYearDate) {
        return "3-5-years";
    }

    if (today < sixYearDate) {
        return "5-6-years";
    }

    return "archived";
}

async function loadChildren() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/children"
        );

        if (!response.ok) {
            throw new Error("Failed to load children");
        }

        children = await response.json();

        updateDashboard();

        if (selectedAgeGroup) {
            displayChildren();
        }
    } catch (error) {
        console.error(error);
        alert("Unable to load child records.");
    }
}

async function loadArchivedChildren() {
    try {
        const response = await fetch(
            "http://localhost:3000/api/children/archived"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load archived children"
            );
        }

        const archivedChildren =
            await response.json();

        displayArchivedChildren(
            archivedChildren
        );
    } catch (error) {
        console.error(error);
        alert(
            "Unable to load archived children."
        );
    }
}

function displayArchivedChildren(archivedChildren) {
    if (!archivedChildrenTable) {
        return;
    }

    const searchText =
        archivedSearch
            ? archivedSearch.value
                .toLowerCase()
                .trim()
            : "";

    const filteredChildren =
        archivedChildren.filter(
            function (child) {
                return child.name
                    .toLowerCase()
                    .includes(searchText);
            }
        );

    archivedChildrenTable.innerHTML = "";

    if (filteredChildren.length === 0) {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="8">
                No archived children found
            </td>
        `;

        archivedChildrenTable.appendChild(row);

        return;
    }

    filteredChildren.forEach(
        function (child) {
            const age =
                calculateAge(child.dob);

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${child.name}</td>
                <td>${formatDate(child.dob)}</td>
                <td>
                    ${age.years} years
                    ${age.months} months
                </td>
                <td>${child.gender}</td>
                <td>${child.parent_name}</td>
                <td>${child.contact}</td>
                <td>${child.status}</td>
                <td>
                    <button class="view-archived-btn">
                        View
                    </button>
                </td>
            `;

            archivedChildrenTable.appendChild(row);

            row.querySelector(
                ".view-archived-btn"
            ).addEventListener(
                "click",
                function () {
                    window.location.href =
                        "child-details.html?id=" +
                        child.id;
                }
            );
        }
    );
}

if (archivedSearch) {
    archivedSearch.addEventListener(
        "input",
        function () {
            loadArchivedChildren();
        }
    );
}

function getActiveChildren() {
    return children.filter(
        function (child) {
            return child.status === "active";
        }
    );
}

if (getStartedBtn) {
    getStartedBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "login.html";
        }
    );
}

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            window.location.href =
                "dashboard.html";
        }
    );
}

if (logoutBtn) {
    logoutBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "login.html";
        }
    );
}

if (addChildBtn) {
    addChildBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "add-child.html";
        }
    );
}

if (archivedChildrenBtn) {
    archivedChildrenBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "archived.html";
        }
    );
}

if (backDashboardBtn) {
    backDashboardBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "dashboard.html";
        }
    );
}

if (cancelChildBtn) {
    cancelChildBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "dashboard.html";
        }
    );
}

if (childForm) {
    childForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const childData = {
                name:
                    document.getElementById(
                        "childName"
                    ).value,

                dob:
                    document.getElementById(
                        "dob"
                    ).value,

                gender:
                    document.getElementById(
                        "gender"
                    ).value,

                parent_name:
                    document.getElementById(
                        "parentName"
                    ).value,

                contact:
                    document.getElementById(
                        "contact"
                    ).value,

                height:
                    document.getElementById(
                        "height"
                    ).value,

                weight:
                    document.getElementById(
                        "weight"
                    ).value
            };

            try {
                const response =
                    await fetch(
                        "http://localhost:3000/api/children",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    childData
                                )
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    alert(
                        result.message ||
                        "Failed to add child"
                    );

                    return;
                }

                alert(
                    "Child added successfully!"
                );

                window.location.href =
                    "dashboard.html";
            } catch (error) {
                console.error(error);

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
}

function updateDashboard() {
    const activeChildren =
        getActiveChildren();

    if (!totalChildren) {
        return;
    }

    totalChildren.textContent =
        activeChildren.length;

    totalBoys.textContent =
        activeChildren.filter(
            function (child) {
                return child.gender === "Boy";
            }
        ).length;

    totalGirls.textContent =
        activeChildren.filter(
            function (child) {
                return child.gender === "Girl";
            }
        ).length;

    ageCards.forEach(
        function (card) {
            const group =
                card.dataset.group;

            const groupChildren =
                activeChildren.filter(
                    function (child) {
                        return (
                            getAgeGroup(
                                child.dob
                            ) === group
                        );
                    }
                );

            const boys =
                groupChildren.filter(
                    function (child) {
                        return child.gender === "Boy";
                    }
                ).length;

            const girls =
                groupChildren.filter(
                    function (child) {
                        return child.gender === "Girl";
                    }
                ).length;

            const total =
                groupChildren.length;

            const boysElement =
                card.querySelector(
                    ".group-boys"
                );

            const girlsElement =
                card.querySelector(
                    ".group-girls"
                );

            const totalElement =
                card.querySelector(
                    ".group-total"
                );

            if (boysElement) {
                boysElement.textContent =
                    boys;
            }

            if (girlsElement) {
                girlsElement.textContent =
                    girls;
            }

            if (totalElement) {
                totalElement.textContent =
                    total;
            }
        }
    );
}

function displayChildren() {
    if (
        !childrenTable ||
        !selectedAgeGroup
    ) {
        return;
    }

    const searchText =
        searchChild
            ? searchChild.value
                .toLowerCase()
                .trim()
            : "";

    const selectedGender =
        genderFilter
            ? genderFilter.value
            : "All";

    let filteredChildren =
        getActiveChildren().filter(
            function (child) {
                return (
                    getAgeGroup(
                        child.dob
                    ) === selectedAgeGroup
                );
            }
        );

    filteredChildren =
        filteredChildren.filter(
            function (child) {
                const matchesName =
                    child.name
                        .toLowerCase()
                        .includes(searchText);

                const matchesGender =
                    selectedGender === "All" ||
                    child.gender ===
                        selectedGender;

                return (
                    matchesName &&
                    matchesGender
                );
            }
        );

    childrenTable.innerHTML = "";

    if (filteredChildren.length === 0) {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td colspan="6">
                No children found
            </td>
        `;

        childrenTable.appendChild(row);

        return;
    }

    filteredChildren.forEach(
        function (child) {
            const age =
                calculateAge(child.dob);

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${child.name}</td>

                <td>
                    ${age.years} years
                    ${age.months} months
                </td>

                <td>${child.gender}</td>

                <td>${child.height} cm</td>

                <td>${child.weight} kg</td>

                <td>
                    <button class="view-child-btn">
                        View
                    </button>

                    <button class="edit-child-btn">
                        Edit
                    </button>

                    <button class="delete-child-btn">
                        Delete
                    </button>
                </td>
            `;

            childrenTable.appendChild(row);

            row.querySelector(
                ".view-child-btn"
            ).addEventListener(
                "click",
                function () {
                    window.location.href =
                        "child-details.html?id=" +
                        child.id;
                }
            );

            row.querySelector(
                ".edit-child-btn"
            ).addEventListener(
                "click",
                function () {
                    window.location.href =
                        "edit-child.html?id=" +
                        child.id;
                }
            );

            row.querySelector(
                ".delete-child-btn"
            ).addEventListener(
                "click",
                async function () {
                    const confirmed =
                        confirm(
                            "Are you sure you want to delete " +
                            child.name +
                            "?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    try {
                        const response =
                            await fetch(
                                "http://localhost:3000/api/children/" +
                                child.id,
                                {
                                    method: "DELETE"
                                }
                            );

                        const result =
                            await response.json();

                        if (!response.ok) {
                            alert(
                                result.message ||
                                "Failed to delete child"
                            );

                            return;
                        }

                        alert(
                            "Child deleted successfully!"
                        );

                        await loadChildren();

                    } catch (error) {
                        console.error(error);

                        alert(
                            "Unable to connect to the server."
                        );
                    }
                }
            );
        }
    );
}

if (ageCards.length > 0) {
    ageCards.forEach(
        function (card) {
            card.addEventListener(
                "click",
                function () {
                    selectedAgeGroup =
                        card.dataset.group;

                    if (selectedGroup) {
                        selectedGroup.textContent =
                            card.querySelector(
                                "h3"
                            ).textContent;
                    }

                    if (searchChild) {
                        searchChild.value = "";
                    }

                    if (genderFilter) {
                        genderFilter.value =
                            "All";
                    }

                    displayChildren();

                    const childrenSection =
                        document.querySelector(
                            ".children-section"
                        );

                    if (childrenSection) {
                        childrenSection.scrollIntoView(
                            {
                                behavior:
                                    "smooth"
                            }
                        );
                    }
                }
            );
        }
    );
}

if (searchChild) {
    searchChild.addEventListener(
        "input",
        function () {
            displayChildren();
        }
    );
}

if (genderFilter) {
    genderFilter.addEventListener(
        "change",
        function () {
            displayChildren();
        }
    );
}

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const childId =
    urlParams.get("id");

async function loadChildDetails() {
    if (!childId || editChildForm) {
        return;
    }

    try {
        const response =
            await fetch(
                "http://localhost:3000/api/children/" +
                childId
            );

        if (!response.ok) {
            throw new Error(
                "Child not found"
            );
        }

        const child =
            await response.json();

        const age =
            calculateAge(child.dob);

        const detailsName =
            document.getElementById(
                "detailsName"
            );

        const detailsChildName =
            document.getElementById(
                "detailsChildName"
            );

        const detailsDob =
            document.getElementById(
                "detailsDob"
            );

        const detailsAge =
            document.getElementById(
                "detailsAge"
            );

        const detailsAgeGroup =
            document.getElementById(
                "detailsAgeGroup"
            );

        const detailsGender =
            document.getElementById(
                "detailsGender"
            );

        const detailsParent =
            document.getElementById(
                "detailsParent"
            );

        const detailsContact =
            document.getElementById(
                "detailsContact"
            );

        const detailsHeight =
            document.getElementById(
                "detailsHeight"
            );

        const detailsWeight =
            document.getElementById(
                "detailsWeight"
            );

        if (detailsName) {
            detailsName.textContent =
                child.name;
        }

        if (detailsChildName) {
            detailsChildName.textContent =
                child.name;
        }

        if (detailsDob) {
            detailsDob.textContent =
                formatDate(child.dob);
        }

        if (detailsAge) {
            detailsAge.textContent =
                age.years +
                " years " +
                age.months +
                " months";
        }

        if (detailsAgeGroup) {
            detailsAgeGroup.textContent =
                getAgeGroup(child.dob);
        }

        if (detailsGender) {
            detailsGender.textContent =
                child.gender;
        }

        if (detailsParent) {
            detailsParent.textContent =
                child.parent_name;
        }

        if (detailsContact) {
            detailsContact.textContent =
                child.contact;
        }

        if (detailsHeight) {
            detailsHeight.textContent =
                child.height +
                " cm";
        }

        if (detailsWeight) {
            detailsWeight.textContent =
                child.weight +
                " kg";
        }
    } catch (error) {
        console.error(error);

        alert(
            "Unable to load child details."
        );
    }
}

if (editChildForm) {
    async function loadEditChild() {
        try {
            const response =
                await fetch(
                    "http://localhost:3000/api/children/" +
                    childId
                );

            if (!response.ok) {
                throw new Error(
                    "Child not found"
                );
            }

            const child =
                await response.json();

            document.getElementById(
                "editChildName"
            ).value =
                child.name;

            document.getElementById(
                "editDob"
            ).value =
                formatDate(child.dob);

            document.getElementById(
                "editGender"
            ).value =
                child.gender;

            document.getElementById(
                "editParentName"
            ).value =
                child.parent_name;

            document.getElementById(
                "editContact"
            ).value =
                child.contact;

            document.getElementById(
                "editHeight"
            ).value =
                child.height;

            document.getElementById(
                "editWeight"
            ).value =
                child.weight;

        } catch (error) {
            console.error(error);

            alert(
                "Unable to load child record."
            );
        }
    }

    loadEditChild();

    editChildForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const updatedChild = {
                name:
                    document.getElementById(
                        "editChildName"
                    ).value,

                dob:
                    document.getElementById(
                        "editDob"
                    ).value,

                gender:
                    document.getElementById(
                        "editGender"
                    ).value,

                parent_name:
                    document.getElementById(
                        "editParentName"
                    ).value,

                contact:
                    document.getElementById(
                        "editContact"
                    ).value,

                height:
                    document.getElementById(
                        "editHeight"
                    ).value,

                weight:
                    document.getElementById(
                        "editWeight"
                    ).value
            };

            try {
                const response =
                    await fetch(
                        "http://localhost:3000/api/children/" +
                        childId,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    updatedChild
                                )
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    alert(
                        result.message ||
                        "Failed to update child"
                    );

                    return;
                }

                alert(
                    "Child record updated successfully!"
                );

                window.location.href =
                    "child-details.html?id=" +
                    childId;

            } catch (error) {
                console.error(error);

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener(
        "click",
        function () {
            window.location.href =
                "dashboard.html";
        }
    );
}

if (editDetailsBtn) {
    editDetailsBtn.addEventListener(
        "click",
        function () {
            const id =
                new URLSearchParams(
                    window.location.search
                ).get("id");

            if (id) {
                window.location.href =
                    "edit-child.html?id=" +
                    id;
            }
        }
    );
}

if (childrenTable) {
    loadChildren();
}

if (archivedChildrenTable) {
    loadArchivedChildren();
}

if (
    document.getElementById(
        "detailsName"
    )
) {
    loadChildDetails();
}
const deleteDetailsBtn =
    document.getElementById("deleteDetailsBtn");

if (deleteDetailsBtn) {

    deleteDetailsBtn.addEventListener(
        "click",
        async function () {

            const id =
                new URLSearchParams(
                    window.location.search
                ).get("id");

            if (!id) {
                return;
            }

            const confirmed =
                confirm(
                    "Are you sure you want to delete this child record?"
                );

            if (!confirmed) {
                return;
            }

            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/children/" + id,
                        {
                            method: "DELETE"
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    alert(
                        result.message ||
                        "Failed to delete child"
                    );

                    return;
                }

                alert(
                    "Child deleted successfully!"
                );

                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
}