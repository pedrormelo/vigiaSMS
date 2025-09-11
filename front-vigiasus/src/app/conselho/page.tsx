import AddCard from "@/components/conselho/addCard";
import EventsSection from "@/components/conselho/eventSection";
//import DatasImportantes from "@/components/conselho/datasImportantes";
import Galeria from "@/components/conselho/galeria";
import HeroCMS from "@/components/conselho/heroCMS";
import Resolutions from "@/components/conselho/resolutions";

export default function CMSpage() {
    return (
        <main>
         <HeroCMS />
         <EventsSection/>
          <Galeria/>
        </main>
    )
}