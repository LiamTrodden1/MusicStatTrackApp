/**
 * @vitest-environment jsdom
 */

import { beforeEach, test, expect, vi, describe, it } from "vitest";
import { collection, getDocs } from "firebase/firestore";
import { displayRecentAlbums } from "./testFunctions/dashboardFunctions";
import { loadDashboardData } from "./testFunctions/dashboardFunctions";

// display album cards
describe("displayRecentAlbums", () => {
    beforeEach(() => {
        document.body.innerHTML = `<div id="recentAlbums" class="recentAlbumsContainer"></div>`;
    });

    // display empty when no albums
    it("display empty state when no albums", () => {
        displayRecentAlbums([]);
        expect(document.querySelector(".emptyState")).toBeTruthy();
    });

    // when albums exist
    it("renders album cards", () => {
        const albums = [
            { name: "Test Album", artists: "Test Artist", image: "img.jpg" }
        ];
        displayRecentAlbums(albums);
        const card = document.querySelector(".dashboardCard");
        expect(card).toBeTruthy();
        expect(card.querySelector(".dashboardAlbumTitle").textContent).toBe("Test Album");
    });
});



