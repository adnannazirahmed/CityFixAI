-- ─────────────────────────────────────────────────────────────────────────────
-- CityFix AI — Seed Data (35 Worcester, MA demo reports)
-- Run AFTER the migration script.
-- WARNING: clears all existing reports, clusters, and insights first.
-- ─────────────────────────────────────────────────────────────────────────────

TRUNCATE TABLE area_insights, report_status_history, reports, duplicate_clusters RESTART IDENTITY CASCADE;

-- ─── Clusters (reports reference these) ──────────────────────────────────────
INSERT INTO duplicate_clusters (id, category, center_latitude, center_longitude, cluster_size, status, neighborhood, created_at)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'pothole',            42.2630, -71.8020, 4, 'submitted',    'Downtown / Lincoln Square',    NOW() - INTERVAL '4 days'),
  ('11111111-0000-0000-0000-000000000002', 'broken_streetlight', 42.2600, -71.7900, 4, 'under_review', 'Grafton Hill / Vernon Hill',   NOW() - INTERVAL '14 days'),
  ('11111111-0000-0000-0000-000000000003', 'illegal_dumping',    42.2485, -71.8058, 2, 'under_review', 'Main South',                   NOW() - INTERVAL '4 days'),
  ('11111111-0000-0000-0000-000000000004', 'pothole',            42.2820, -71.7949, 2, 'assigned',     'Burncoat / Great Brook Valley', NOW() - INTERVAL '21 days'),
  ('11111111-0000-0000-0000-000000000005', 'damaged_sidewalk',   42.2722, -71.8047, 2, 'submitted',    'Lincoln Square',               NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- ─── Reports ─────────────────────────────────────────────────────────────────
INSERT INTO reports (id, title, description, latitude, longitude, address, neighborhood, category, severity, ai_summary, urgency_score, impact_score, priority_score, priority_level, ai_reasoning, recommended_action, status, duplicate_cluster_id, created_at, updated_at)
VALUES
  (
    '22222222-0001-0000-0000-000000000001',
    'Large Pothole on Main Street Near City Hall',
    'Deep pothole approximately 2ft wide on Main St just south of City Hall. Vehicles swerving into oncoming lane.',
    42.2629, -71.8022, '455 Main St', 'Downtown', 'pothole', 'high',
    'Large pothole on high-traffic downtown arterial near City Hall. Multiple vehicles affected daily.',
    88, 84, 87, 'critical',
    'High urgency due to proximity to City Hall pedestrian traffic and high vehicle volume.',
    'Prioritize inspection and repair within 24 hours.',
    'submitted', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0002-0000-0000-000000000002',
    'Broken Streetlight Near Grafton Hill Elementary',
    'Streetlight not functioning at corner of Grafton St and Beacon St, near Grafton Hill Elementary. Very dark at night.',
    42.2558, -71.7785, 'Grafton St & Beacon St', 'Grafton Hill', 'broken_streetlight', 'critical',
    'Non-functioning streetlight adjacent to an elementary school creating dangerous nighttime conditions.',
    95, 90, 93, 'critical',
    'Critical safety hazard — proximity to school and complete darkness creates high risk for children and pedestrians.',
    'Emergency repair required within 24 hours. Temporary lighting recommended.',
    'under_review', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0003-0000-0000-000000000003',
    'Cracked Sidewalk Blocking Wheelchair Access on Park Ave',
    'Large crack and raised section on Park Ave sidewalk making it impossible for wheelchair users to pass.',
    42.2651, -71.8447, '890 Park Ave', 'Tatnuck', 'accessibility_hazard', 'high',
    'Severely damaged sidewalk section creates ADA accessibility violation and safety risk for mobility-impaired residents.',
    85, 80, 83, 'critical',
    'ADA compliance issue with direct impact on mobility-impaired community members.',
    'Temporary accessibility rerouting and schedule urgent repair within 48 hours.',
    'in_progress', NULL,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0004-0000-0000-000000000004',
    'Illegal Dumping of Appliances on Chandler Street',
    'Several old appliances (refrigerators, mattresses) dumped on the corner of Chandler St and Woodland St.',
    42.2702, -71.7908, 'Chandler St & Woodland St', 'Chandler', 'illegal_dumping', 'medium',
    'Large pile of illegally dumped appliances including refrigerators and mattresses creating public hazard.',
    68, 65, 67, 'high',
    'Environmental hazard and public nuisance. Refrigerants in old appliances pose chemical risk.',
    'Schedule bulk waste removal within 3-5 business days.',
    'submitted', '11111111-0000-0000-0000-000000000003',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0005-0000-0000-000000000005',
    'Overflowing Trash Bin at Elm Park',
    'Public trash bin at Elm Park main entrance overflowing for 3 days. Attracting pests and raccoons.',
    42.2728, -71.8012, 'Elm Park, Lincoln St entrance', 'Lincoln Square', 'trash_overflow', 'medium',
    'Overflowing public trash receptacle creating sanitation hazard and pest attraction in high-traffic park area.',
    55, 52, 54, 'medium',
    'Medium priority sanitation issue. Not an immediate safety hazard but degrades public space quality.',
    'Schedule immediate collection and increase pickup frequency.',
    'resolved', NULL,
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days'
  ),
  (
    '22222222-0006-0000-0000-000000000006',
    'Road Debris Blocking Lane on Belmont Street',
    'Large pile of fallen tree branches blocking the right lane on Belmont St after last night''s storm.',
    42.2699, -71.7893, 'Belmont St near Sunderland Rd', 'Chandler', 'road_obstruction', 'high',
    'Storm debris blocking traffic lane on major arterial road creating collision risk and traffic congestion.',
    82, 78, 80, 'critical',
    'Active traffic hazard on high-volume road. Risk of accidents is immediate.',
    'Emergency clearance required within 2 hours.',
    'in_progress', NULL,
    NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'
  ),
  (
    '22222222-0007-0000-0000-000000000007',
    'Faded Stop Sign on Pleasant Street',
    'Stop sign at corner of Pleasant St and Fruit St is severely faded and barely readable, especially at night.',
    42.2548, -71.8098, 'Pleasant St & Fruit St', 'Main South', 'broken_sign', 'medium',
    'Traffic stop sign severely weathered and unreadable, creating potential traffic safety violation.',
    58, 55, 57, 'medium',
    'Traffic safety concern. Unreadable stop sign can lead to accidents at intersection.',
    'Replace sign within 5 business days.',
    'assigned', NULL,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'
  ),
  (
    '22222222-0008-0000-0000-000000000008',
    'Pothole Cluster on Shrewsbury Street',
    'Multiple large potholes in a 50-meter stretch on Shrewsbury St near the restaurant district. Road deteriorating rapidly.',
    42.2681, -71.7872, '300-350 Shrewsbury St', 'Shrewsbury Street', 'pothole', 'critical',
    'Cluster of multiple severe potholes on popular restaurant district road indicating systemic infrastructure degradation.',
    84, 88, 86, 'critical',
    'Multiple reports confirm recurring degradation. High traffic volume from restaurant district amplifies safety risk.',
    'Full road surface assessment and emergency patching within 48 hours.',
    'under_review', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0009-0000-0000-000000000009',
    'Pothole Near UMass Memorial Medical Center Entrance',
    'Deep pothole right at the ambulance entrance of UMass Memorial on Lake Ave. Emergency vehicles affected.',
    42.2760, -71.7948, 'UMass Memorial Medical Center, Lake Ave', 'Burncoat', 'pothole', 'critical',
    'Severe pothole at hospital emergency vehicle access point threatening critical emergency response capability.',
    97, 92, 95, 'critical',
    'Extreme urgency — pothole at hospital entrance directly impacts emergency response times.',
    'IMMEDIATE repair required. Coordinate with hospital facilities team.',
    'assigned', '11111111-0000-0000-0000-000000000004',
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0010-0000-0000-000000000010',
    'Missing Manhole Cover on Franklin Street',
    'Manhole cover completely missing on Franklin St near Union Station. Open hole is a serious safety hazard.',
    42.2617, -71.7995, '120 Franklin St', 'Downtown', 'road_obstruction', 'critical',
    'Missing manhole cover creating open road hazard with risk of serious injury to vehicles and pedestrians.',
    98, 90, 95, 'critical',
    'Immediate life-safety threat. Open manhole can cause severe injury or vehicle damage.',
    'EMERGENCY: Barricade immediately and replace cover within 2 hours.',
    'in_progress', NULL,
    NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 hours'
  ),
  (
    '22222222-0011-0000-0000-000000000011',
    'Sidewalk Crack Near Great Brook Valley Bus Stop',
    'Large crack in sidewalk near WRTA bus stop on Plantation St. Elderly residents having trouble navigating.',
    42.2898, -71.8195, 'Plantation St at WRTA Bus Stop', 'Great Brook Valley', 'damaged_sidewalk', 'medium',
    'Significant sidewalk crack adjacent to a bus stop creating trip hazard for transit users including elderly residents.',
    72, 68, 71, 'high',
    'Bus stop proximity increases daily impact. Elderly and mobility-challenged users at heightened risk.',
    'Inspect and schedule repair within 3-5 days.',
    'submitted', NULL,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
  ),
  (
    '22222222-0012-0000-0000-000000000012',
    'Streetlight Outage — Downtown Main Street Block',
    'Two streetlights out on Main St between Front St and Foster St. The whole block is very dark.',
    42.2635, -71.8018, 'Main St, Front St to Foster St', 'Downtown', 'broken_streetlight', 'high',
    'Two consecutive streetlights non-functional creating a dark corridor on main commercial downtown street.',
    76, 72, 75, 'high',
    'Multiple streetlights out on main commercial corridor increases crime risk and pedestrian safety concerns.',
    'Repair or replace both fixtures within 48 hours.',
    'under_review', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0013-0000-0000-000000000013',
    'Flooding at Great Brook Valley Underpass',
    'Water accumulation at the underpass on Burncoat St after rain. Road impassable for low vehicles.',
    42.2905, -71.8215, 'Burncoat St Underpass', 'Great Brook Valley', 'flooding', 'high',
    'Underpass flooding creating impassable road condition and risk of vehicle damage or driver injury.',
    88, 82, 86, 'critical',
    'Flooding at underpass blocks critical transit route and poses vehicle and pedestrian safety risk.',
    'Deploy pumping equipment and inspect drainage system immediately.',
    'submitted', NULL,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0014-0000-0000-000000000014',
    'Graffiti on Main South Library Branch',
    'Large graffiti tag on the side wall of the Main South branch library on Chandler St.',
    42.2491, -71.8062, 'Chandler Branch Library, Main South', 'Main South', 'graffiti', 'low',
    'Graffiti vandalism on public library building requiring remediation to maintain community appearance.',
    28, 22, 26, 'low',
    'Low safety priority but impacts community aesthetics and public property.',
    'Schedule graffiti removal within 2 weeks.',
    'resolved', NULL,
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days'
  ),
  (
    '22222222-0015-0000-0000-000000000015',
    'Pothole Worsening on Highland Street',
    'Pothole on Highland St near Holy Cross has doubled in size after last week''s rain. Very dangerous for cyclists.',
    42.2580, -71.8220, '800 Highland St', 'Tatnuck', 'pothole', 'high',
    'Rapidly expanding pothole on mixed-use road with bicycle lane. Active worsening indicates sub-base failure.',
    80, 76, 79, 'high',
    'Expanding pothole suggests deeper infrastructure issue. Cycling lane proximity increases injury risk.',
    'Sub-base inspection and comprehensive repair within 48 hours.',
    'submitted', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  ),
  (
    '22222222-0016-0000-0000-000000000016',
    'Broken Bench at Green Hill Park',
    'Park bench with broken slats and exposed nails near the playground at Green Hill Park. Children playing nearby.',
    42.2798, -71.7850, 'Green Hill Park, Skyline Dr', 'Burncoat', 'other', 'medium',
    'Damaged park bench with exposed sharp components near children''s play area creating injury risk.',
    52, 45, 49, 'medium',
    'Moderate priority due to exposed nails near children''s play area.',
    'Remove or barricade bench and schedule replacement within 1 week.',
    'submitted', NULL,
    NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
  ),
  (
    '22222222-0017-0000-0000-000000000017',
    'Illegal Dumping — Main South Alley',
    'Construction waste illegally dumped in alley off Southgate St in Main South, blocking resident access.',
    42.2478, -71.8055, 'Southgate St alley, Main South', 'Main South', 'illegal_dumping', 'medium',
    'Large construction waste dump in residential alley blocking access and creating environmental hazard.',
    62, 60, 61, 'high',
    'Construction debris blocking residential access. Potential hazardous materials require investigation.',
    'Investigate source and schedule removal within 3 days.',
    'under_review', '11111111-0000-0000-0000-000000000003',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0018-0000-0000-000000000018',
    'Broken Traffic Signal — Kelley Square',
    'Traffic light at Kelley Square cycling incorrectly — a notoriously complex intersection now showing conflicting signals.',
    42.2563, -71.8085, 'Kelley Square, Main St & Millbury St', 'Downtown', 'road_obstruction', 'critical',
    'Malfunctioning traffic signal at Kelley Square simultaneously showing green in conflicting directions — critical collision risk.',
    99, 95, 97, 'critical',
    'CRITICAL: Kelley Square is one of Worcester''s most complex intersections. Signal failure is a direct collision hazard.',
    'EMERGENCY: Deploy traffic control officer immediately and dispatch signal repair team.',
    'in_progress', NULL,
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
  ),
  (
    '22222222-0019-0000-0000-000000000019',
    'Damaged Sidewalk Near Great Brook Valley School',
    'Buckled and cracked sidewalk along Great Brook Valley Early Childhood Center drop-off zone.',
    42.2888, -71.8188, 'Great Brook Valley Early Childhood Center', 'Great Brook Valley', 'damaged_sidewalk', 'high',
    'Severely damaged sidewalk in school drop-off zone creates daily trip hazard for children and parents.',
    82, 80, 81, 'critical',
    'School proximity and child safety makes this high priority.',
    'Emergency repair before next school day.',
    'submitted', NULL,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0020-0000-0000-000000000020',
    'Trash Overflow — Shrewsbury Street Restaurant Row',
    'Bins behind restaurants on Shrewsbury St overflowing with food waste. Smell is unbearable.',
    42.2675, -71.7865, 'Shrewsbury St Restaurant District', 'Shrewsbury Street', 'trash_overflow', 'medium',
    'Commercial food waste overflow in popular restaurant district creating sanitation and pest control issues.',
    60, 55, 58, 'medium',
    'Sanitation issue in commercial area. Health hazard potential if not addressed.',
    'Commercial sanitation enforcement notice and immediate collection.',
    'resolved', NULL,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days'
  ),
  (
    '22222222-0021-0000-0000-000000000021',
    'Pothole — Great Brook Valley Residential Street',
    'Deep pothole on Tacoma St in Great Brook Valley residential area. Has been there for 3 weeks with no response.',
    42.2880, -71.8175, '45 Tacoma St', 'Great Brook Valley', 'pothole', 'medium',
    'Persistent pothole on residential road unaddressed for over 3 weeks in underserved neighborhood.',
    65, 58, 62, 'high',
    'Time unresolved increases urgency. Great Brook Valley has historically high unresolved issue rates.',
    'Schedule repair and review area for additional road maintenance needs.',
    'submitted', '11111111-0000-0000-0000-000000000004',
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'
  ),
  (
    '22222222-0022-0000-0000-000000000022',
    'Broken Streetlight — Grafton Hill Walking Path',
    'Streetlight along the Grafton Hill trail off Grafton St has been out for 2 weeks. Unsafe at night.',
    42.2545, -71.7775, 'Grafton Hill Trail, Grafton St', 'Grafton Hill', 'broken_streetlight', 'medium',
    'Park pathway lighting outage creating unsafe conditions for evening recreational users.',
    70, 65, 68, 'high',
    '2-week outage suggests maintenance backlog. Path users face elevated risk after dark.',
    'Schedule repair within 48 hours. Install temporary lighting if delayed.',
    'submitted', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'
  ),
  (
    '22222222-0023-0000-0000-000000000023',
    'Water Main Leak — Polar Park Area',
    'Water bubbling up through road surface on Madison St near Polar Park. Possible water main break.',
    42.2565, -71.8095, 'Madison St near Polar Park', 'Downtown', 'flooding', 'critical',
    'Suspected water main leak with surface water emergence near Polar Park stadium on game days.',
    90, 85, 88, 'critical',
    'Potential infrastructure failure. Water main leaks can lead to sinkholes and road collapse.',
    'Contact utilities emergency line immediately. Cordon off area.',
    'in_progress', NULL,
    NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours'
  ),
  (
    '22222222-0024-0000-0000-000000000024',
    'Damaged Sidewalk — Main South Senior Housing',
    'Collapsed sidewalk section outside Plumley Village senior housing on Austin St. Residents cannot safely exit.',
    42.2505, -71.8070, 'Plumley Village, Austin St', 'Main South', 'accessibility_hazard', 'critical',
    'Collapsed sidewalk blocking primary exit of senior housing facility creating immediate accessibility emergency.',
    94, 92, 93, 'critical',
    'Critical: elderly residents cannot safely exit facility. ADA emergency in underserved neighborhood.',
    'IMMEDIATE emergency repair. Coordinate with facility for temporary access solutions.',
    'under_review', NULL,
    NOW() - INTERVAL '36 hours', NOW() - INTERVAL '12 hours'
  ),
  (
    '22222222-0025-0000-0000-000000000025',
    'Graffiti — Great Brook Valley Underpass',
    'Extensive graffiti covering the underpass walls on Plantation St. Been there for months with no cleanup.',
    42.2910, -71.8205, 'Plantation St Underpass', 'Great Brook Valley', 'graffiti', 'low',
    'Extensive long-standing graffiti on public infrastructure in Great Brook Valley underpass.',
    22, 18, 20, 'low',
    'Low safety risk but persistent neglect in Great Brook Valley contributes to neighborhood perception of abandonment.',
    'Schedule graffiti abatement as part of routine Great Brook Valley improvement plan.',
    'submitted', NULL,
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
  ),
  (
    '22222222-0026-0000-0000-000000000026',
    'Missing Curb Cut on Lincoln Street — Wheelchair Users Blocked',
    'No curb cut at Lincoln St & Beacon St. Wheelchair users are forced into traffic to cross. Multiple complaints from residents.',
    42.2726, -71.8043, 'Lincoln St & Beacon St', 'Lincoln Square', 'accessibility_hazard', 'high',
    'Missing ADA curb cut forces mobility-impaired residents into active traffic lanes at busy intersection.',
    86, 83, 85, 'critical',
    'ADA violation at signalized intersection with high pedestrian volume. Wheelchair users diverted into moving traffic daily.',
    'Install temporary ramp and schedule permanent ADA curb cut within 30 days.',
    'submitted', NULL,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  ),
  (
    '22222222-0027-0000-0000-000000000027',
    'Pothole Cluster on Cambridge Street Near Rotary',
    'Four large potholes in a row on Cambridge St approaching the Lincoln Square rotary. Caused a blowout to a delivery truck.',
    42.2731, -71.8061, '450 Cambridge St', 'Lincoln Square', 'pothole', 'critical',
    'Multiple severe potholes on arterial approach to busy rotary intersection. Confirmed vehicle damage reported.',
    88, 85, 87, 'critical',
    'Confirmed vehicle damage and high rotary traffic volume amplify injury risk. Cluster pattern suggests base layer failure.',
    'Emergency patching and full road surface assessment within 48 hours.',
    'under_review', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0028-0000-0000-000000000028',
    'Overflowing Trash Bins — Cristoforo Columbus Park',
    'Both trash bins at Cristoforo Columbus Park are overflowing. Garbage has spilled onto the walking path. Raccoons seen.',
    42.2684, -71.7880, 'Cristoforo Columbus Park, Shrewsbury St', 'Shrewsbury Street', 'trash_overflow', 'medium',
    'Overflow trash conditions in neighborhood park creating sanitation hazard and wildlife attraction.',
    54, 50, 52, 'medium',
    'Medium sanitation priority. Park visitor experience degraded and pest attraction risk.',
    'Immediate collection and increase pickup schedule for this location.',
    'submitted', NULL,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0029-0000-0000-000000000029',
    'Streetlight Out Near Vernon Hill School',
    'Streetlight pole at the corner of Vernon Hill Ave and Enfield St is dark. Kids walk this route home after school activities.',
    42.2493, -71.7858, 'Vernon Hill Ave & Enfield St', 'Vernon Hill', 'broken_streetlight', 'critical',
    'Non-functioning streetlight on a school-adjacent pedestrian route creating after-dark safety risk for children.',
    91, 88, 90, 'critical',
    'Child pedestrian safety on school route. Consistent after-school darkness raises risk of traffic incidents.',
    'Emergency repair required within 24 hours.',
    'under_review', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0030-0000-0000-000000000030',
    'Flooded Intersection at Green Street and Sycamore',
    'Storm drain completely blocked — Green St and Sycamore St intersection is a lake after any rain. Cars stalling out.',
    42.2609, -71.8341, 'Green St & Sycamore St', 'Tatnuck', 'flooding', 'high',
    'Clogged storm drain causing repeated intersection flooding after rainfall with vehicle stall-out incidents.',
    87, 80, 84, 'critical',
    'Repeated flooding after rain events indicates persistent drainage failure. Vehicle damage and pedestrian risk.',
    'Inspect and clear storm drain. Assess drainage infrastructure.',
    'in_progress', NULL,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'
  ),
  (
    '22222222-0031-0000-0000-000000000031',
    'Graffiti on Vernon Hill Community Center Exterior',
    'Spray painted tags on the south wall of Vernon Hill Community Center on Enfield St. Has been there about two weeks.',
    42.2488, -71.7849, 'Vernon Hill Community Center, Enfield St', 'Vernon Hill', 'graffiti', 'low',
    'Graffiti vandalism on community center building in residential neighborhood.',
    25, 20, 23, 'low',
    'Low safety risk. Community morale impact on neighborhood gathering space.',
    'Schedule graffiti removal within 2 weeks during routine maintenance.',
    'submitted', NULL,
    NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'
  ),
  (
    '22222222-0032-0000-0000-000000000032',
    'Buckled Sidewalk on Salisbury Street',
    'Tree root has pushed up a large sidewalk section on Salisbury St near the library. 4-inch rise — very easy to trip over.',
    42.2719, -71.8038, '870 Salisbury St', 'Lincoln Square', 'damaged_sidewalk', 'medium',
    'Tree root heave creating severe trip hazard on residential sidewalk with 4-inch vertical displacement.',
    71, 66, 69, 'high',
    'Significant vertical displacement at 4 inches exceeds trip hazard threshold. High pedestrian usage near library.',
    'Grind or replace affected sidewalk panel. Assess root system impact.',
    'submitted', '11111111-0000-0000-0000-000000000005',
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
  ),
  (
    '22222222-0033-0000-0000-000000000033',
    'Sinkhole Opening on Millbury Street Near Kelley Square',
    'Small sinkhole appearing on Millbury St, about 1 ft wide and growing. Asphalt cracking outward. Possible sewer collapse.',
    42.2561, -71.8075, '15 Millbury St', 'Downtown', 'road_obstruction', 'critical',
    'Developing sinkhole with outward asphalt cracking indicating possible underground sewer infrastructure failure.',
    96, 91, 94, 'critical',
    'Sinkhole near Kelley Square poses imminent collapse risk to vehicles and pedestrians. Potential major infrastructure failure.',
    'EMERGENCY: Barricade immediately. Dispatch engineering team. Contact DPW sewer division.',
    'assigned', NULL,
    NOW() - INTERVAL '7 hours', NOW() - INTERVAL '2 hours'
  ),
  (
    '22222222-0034-0000-0000-000000000034',
    'Illegal Tire Dumping Near Great Brook Valley Soccer Field',
    'Over 20 tires dumped in the woods adjacent to the soccer field off Plantation St. Strong smell and mosquito breeding concern.',
    42.2920, -71.8210, 'Great Brook Valley Soccer Field, Plantation St', 'Great Brook Valley', 'illegal_dumping', 'medium',
    'Large-scale illegal tire dumping near recreational area creating environmental and public health hazard.',
    70, 68, 69, 'high',
    'Standing water in tires is a mosquito breeding hazard. Large-scale dump near family recreational area requires prompt remediation.',
    'Report to DEP for illegal dumping investigation. Schedule tire removal within 5 days.',
    'submitted', NULL,
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
  ),
  (
    '22222222-0035-0000-0000-000000000035',
    'Damaged Sidewalk Outside Lincoln Square YMCA',
    'Cracked and uneven sidewalk panels in front of the YMCA on Ionic Ave. Used heavily by gym members and school groups.',
    42.2724, -71.8055, 'YMCA, Ionic Ave, Lincoln Square', 'Lincoln Square', 'damaged_sidewalk', 'medium',
    'Multiple damaged sidewalk panels at high-traffic YMCA entrance creating trip hazard for daily gym and youth program users.',
    68, 63, 66, 'high',
    'High foot traffic from YMCA including youth programs increases injury risk from damaged surface.',
    'Replace damaged panels and inspect adjacent sections within one week.',
    'submitted', '11111111-0000-0000-0000-000000000005',
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
  )
ON CONFLICT DO NOTHING;

-- ─── Area Insights ────────────────────────────────────────────────────────────
INSERT INTO area_insights (neighborhood, total_reports, unresolved_reports, avg_priority_score, avg_resolution_days, equity_flag, equity_score, top_issues, updated_at)
VALUES
  ('Great Brook Valley', 7, 7, 68, 26.1, TRUE,  94, ARRAY['pothole', 'damaged_sidewalk', 'illegal_dumping'], NOW()),
  ('Main South',        5, 4, 55, 18.2, TRUE,  78, ARRAY['illegal_dumping', 'graffiti', 'broken_sign'],     NOW()),
  ('Downtown',          7, 6, 85, 3.2,  FALSE, 38, ARRAY['road_obstruction', 'flooding', 'pothole'],        NOW()),
  ('Grafton Hill',      3, 2, 58, 8.5,  FALSE, 48, ARRAY['broken_streetlight', 'pothole', 'damaged_sidewalk'], NOW()),
  ('Lincoln Square',    4, 4, 77, 0,    TRUE,  82, ARRAY['pothole', 'damaged_sidewalk', 'accessibility_hazard'], NOW()),
  ('Vernon Hill',       2, 2, 57, 0,    TRUE,  75, ARRAY['broken_streetlight', 'graffiti'],                 NOW())
ON CONFLICT (neighborhood) DO UPDATE SET
  total_reports       = EXCLUDED.total_reports,
  unresolved_reports  = EXCLUDED.unresolved_reports,
  avg_priority_score  = EXCLUDED.avg_priority_score,
  avg_resolution_days = EXCLUDED.avg_resolution_days,
  equity_flag         = EXCLUDED.equity_flag,
  equity_score        = EXCLUDED.equity_score,
  top_issues          = EXCLUDED.top_issues,
  updated_at          = NOW();
